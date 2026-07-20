import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { setCookie } from "hono/cookie";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { signSessionToken } from "./kimi/session";
import { upsertUser } from "./queries/users";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session, Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// Dev login – for local testing only
app.get("/api/dev-login", async (c) => {
  const role = (c.req.query("role") as string) || "admin";
  const validRoles = ["student", "coordinator", "supervisor", "sipp_coordinator", "admin"];
  const safeRole = validRoles.includes(role) ? role : "admin";
  const unionId = "dev-" + safeRole;
  
  await upsertUser({
    unionId,
    name: "Dev " + safeRole.charAt(0).toUpperCase() + safeRole.slice(1),
    role: safeRole as any,
    lastSignInAt: new Date(),
  });
  
  const token = await signSessionToken({ unionId, clientId: env.appId });
  const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
  setCookie(c, Session.cookieName, token, { ...cookieOpts, maxAge: Session.maxAgeMs / 1000 });
  return c.redirect("/", 302);
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
