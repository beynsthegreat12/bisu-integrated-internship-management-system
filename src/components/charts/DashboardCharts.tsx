import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from "recharts"

// ── Colors ──
const COLORS = {
  primary: "#7B1F3A",
  gold: "#D4AF37",
  emerald: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  gray: "#9CA3AF",
}

const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#9CA3AF"]

// ── Pie Chart ──
export function StatusPieChart({ data, title }: {
  data: { name: string; value: number }[]
  title?: string
}) {
  return (
    <div className="w-full">
      {title && <p className="text-xs text-gray-500 font-medium mb-2 text-center">{title}</p>}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={30} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Small Donut Chart ──
export function MiniDonut({ value, max, label, color = COLORS.emerald }: {
  value: number; max: number; label: string; color?: string
}) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0
  const data = [
    { name: label, value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ]

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={100} height={100}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={30} outerRadius={45}
            dataKey="value"
            startAngle={90} endAngle={-270}
          >
            <Cell fill={color} />
            <Cell fill="#E5E7EB" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-lg font-bold text-[#1A1A2E] -mt-8">{percentage}%</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  )
}

// ── Bar Chart ──
export function SimpleBarChart({ data, dataKey, bars, title }: {
  data: any[]
  dataKey: string
  bars: { key: string; color: string; name: string }[]
  title?: string
}) {
  return (
    <div className="w-full">
      {title && <p className="text-xs text-gray-500 font-medium mb-2">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey={dataKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          {bars.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} fill={bar.color} name={bar.name} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Line Chart ──
export function SimpleLineChart({ data, lines, title }: {
  data: any[]
  lines: { key: string; color: string; name: string }[]
  title?: string
}) {
  return (
    <div className="w-full">
      {title && <p className="text-xs text-gray-500 font-medium mb-2">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Horizontal Stacked Bar (for status distribution) ──
export function StackedBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="w-full space-y-2">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium text-[#1A1A2E]">{item.value}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export { COLORS, PIE_COLORS }