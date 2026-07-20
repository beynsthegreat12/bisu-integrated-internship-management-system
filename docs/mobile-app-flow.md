# BISU Internship Management System — Mobile App Flow

## 📱 Overview

Ang mobile app sa BISU Internship Management System kay usa ka role-based application nga naga-serve sa **Student**, **Coordinator**, **Supervisor**, **SIPP Coordinator**, ug **Admin**. Ang system kay built gamit ang React + Vite + tRPC + MySQL (via Drizzle ORM).

---

## 🔐 1. Authentication Flow

```mermaid
flowchart TD
    A[Open App] --> B{Is Authenticated?}
    B -->|No| C[Login Page]
    B -->|Yes| D[Role-Based Redirect]
    
    C --> E[Enter Email/Student ID & Password]
    E --> F[Submit Login]
    F --> G{tRPC: auth.login}
    G -->|Success| H[Set Session/Cookie]
    H --> I[Invalidate auth.me query]
    I --> D
    G -->|Failed| J[Show Error Message]
    J --> E
    
    D --> K{User Role}
    K -->|student| L[/student/dashboard]
    K -->|coordinator| M[/coordinator/dashboard]
    K -->|supervisor| N[/supervisor/dashboard]
    K -->|sipp_coordinator| O[/sipp/dashboard]
    K -->|admin| M
    
    L --> P{Logout?}
    M --> P
    N --> P
    O --> P
    P -->|Yes| Q[tRPC: auth.logout]
    Q --> R[Clear Session]
    R --> C
```

### Auth Implementation Details:
- **Hook:** `src/hooks/useAuth.ts` — wraps tRPC `auth.me` query
- **API:** `api/auth-router.ts` — handles login/logout
- **Session:** JWT-based via cookies (`jose` library)
- **Stale Time:** 5 minutes for user data caching
- **Auto-redirect:** `ProtectedRoute` component checks allowed roles

---

## 👤 2. Student Flow

```mermaid
flowchart TD
    A[Student Dashboard] --> B{Quick Actions}
    
    B --> C[Log DTR]
    B --> D[Submit Report]
    B --> E[View Tasks]
    B --> F[Messages]
    B --> G[View Dashboard Stats]
    
    subgraph S1 [Daily Time Record]
        C --> C1[Calendar View - Month Selector]
        C1 --> C2[Time In / Time Out Buttons]
        C2 --> C2a[Time In: Auto-record AM Arrival]
        C2 --> C2b[Time Out: Auto-record PM Departure]
        C2a --> C3[Auto-compute: Total Hours, Late, Undertime]
        C2b --> C3
        C3 --> C4[Export: PDF / Excel / Print CS Form 48]
    end
    
    subgraph S2 [Accomplishment Reports]
        D --> D1[Create Report: Date + Description + File Upload]
        D1 --> D2[Status: Pending / Approved / Rejected]
        D2 --> D3[View Report History]
    end
    
    subgraph S3 [Tasks]
        E --> E1[View Kanban Board: Pending → In Progress → Completed]
        E1 --> E2[Update Task Status]
        E2 --> E3[View Due Dates & Details]
    end
    
    subgraph S4 [Messaging]
        F --> F1[Select Conversation Partner]
        F1 --> F2[Send/Receive Messages]
        F2 --> F3[Real-time Updates via refetch]
    end
    
    subgraph S5 [Dashboard Stats]
        G --> G1[Stats Cards: Hours, Pending Tasks, Reports, Attendance]
        G1 --> G2[Internship Progress Bar: 486h Required]
        G2 --> G3[Pending Tasks List]
        G3 --> G4[Recent Reports List]
    end
    
    C1 --> H{Permission Check}
    H -->|Student Only| C2
```

### Student Routes:
| Path | Component | Description |
|------|-----------|-------------|
| `/student/dashboard` | `StudentDashboard` | Stats, quick actions, pending tasks, recent reports |
| `/student/dtr` | `DTRPage` | Monthly calendar, **Time In/Time Out**, CS Form 48 export |
| `/student/reports` | `ReportsPage` | CRUD accomplishment reports with file upload |
| `/student/tasks` | `TasksPage` | Kanban board for assigned tasks |
| `/student/messages` | `MessagesPage` | Direct messaging with supervisor/coordinator |

---

## 👔 3. Coordinator Flow

```mermaid
flowchart TD
    A[Coordinator Dashboard] --> B{Modules}
    
    B --> C[Students / Assignments]
    B --> D[DTR - View All Students]
    B --> E[Reports - Review]
    B --> F[Tasks - Manage]
    B --> G[Evaluations]
    B --> H[Site Visits]
    B --> I[HTE Partners]
    B --> J[Pull-Out Monitor]
    
    subgraph C1 [Student Assignments]
        C --> C1a[List All Assignments]
        C1a --> C1b[Assign Student to HTE]
        C1b --> C1c[Set: HTE, College, Coordinator, Dates]
        C1c --> C1d[Status: Active / Completed / Cancelled]
    end
    
    subgraph D1 [DTR Management]
        D --> D1a[Month Selector]
        D1a --> D1b[View All Students Attendance]
        D1b --> D1c[Search by Student Name]
        D1c --> D1d[Filter by Status]
        D1d --> D1e[Edit/Delete Records]
        D1e --> D1f[Coordinator Stats Summary]
    end
    
    subgraph E1 [Reports Review]
        E --> E1a[List All Reports with Filters]
        E1a --> E1b[Filter: Status / Student / Date Range]
        E1b --> E1c[View Report Details]
        E1c --> E1d[Approve / Reject Report]
        E1d --> E1e[Add Coordinator Remarks]
    end
    
    subgraph J1 [Pull-Out Monitoring]
        J --> J1a[List Active Assignments]
        J1a --> J1b[Select Student for Pull-Out]
        J1b --> J1c[Enter Pull-Out Reason]
        J1c --> J1d[Confirm: Status → pull_out]
        J1d --> J1e[View Pull-Out History & Count]
    end
    
    subgraph G1 [Evaluations]
        G --> G1a[View Evaluation List]
        G1a --> G1b[Coordinator Evaluation Form]
        G1b --> G1c[Rate: 1-5 on Multiple Criteria]
        G1c --> G1d[Auto-compute Overall Grade]
        G1d --> G1e[AI Summary Generation]
    end
    
    subgraph H1 [Site Visits]
        H --> H1a[Schedule Visit]
        H1a --> H1b[Select: Student + HTE + Date]
        H1b --> H1c[Status: Scheduled → Completed/Cancelled]
    end
```

### Coordinator Routes:
| Path | Component | Description |
|------|-----------|-------------|
| `/coordinator/dashboard` | `CoordinatorDashboard` | Overview stats |
| `/coordinator/students` | `AssignmentsPage` | Assign students to HTEs |
| `/coordinator/dtr` | `DTRPage` | View & manage all student DTRs |
| `/coordinator/reports` | `ReportsPage` | Approve/reject accomplishment reports |
| `/coordinator/tasks` | `TasksPage` | Create & manage tasks for students |
| `/coordinator/evaluations` | `EvaluationsPage` | Evaluate student performance |
| `/coordinator/visits` | `SiteVisitsPage` | Schedule & track site visits |
| `/coordinator/htes` | `HTEsPage` | Manage HTE partners |
| `/coordinator/pullouts` | `PullOutMonitoring` | Monitor pulled-out students |

---

## 🔧 4. Supervisor Flow

```mermaid
flowchart TD
    A[Supervisor Dashboard] --> B{Modules}
    
    B --> C[Tasks - Create & Assign]
    B --> D[Evaluations - HTE Rating]
    B --> E[Messages]
    
    subgraph C1 [Task Management]
        C --> C1a[Create Task: Title + Description + Due Date]
        C1a --> C1b[Assign to Student]
        C1b --> C1c[Track: Pending → In Progress → Completed]
    end
    
    subgraph D1 [HTE Evaluation]
        D --> D1a[View Students Under HTE]
        D1a --> D1b[Rate: Job Performance Criteria]
        D1b --> D1c[Categories: Personal, Interpersonal, Job-Specific Skills]
        D1c --> D1d[Submit Evaluation with Comments]
    end
    
    subgraph E1 [Messaging]
        E --> E1a[View Conversations]
        E1a --> E1b[Send/Receive Messages]
        E1b --> E1c[DTR Remarks/Feedback]
    end
```

### Supervisor Routes:
| Path | Component | Description |
|------|-----------|-------------|
| `/supervisor/dashboard` | `SupervisorDashboard` | Overview |
| `/supervisor/tasks` | `TasksPage` | Assign & track student tasks |
| `/supervisor/evaluations` | `EvaluationsPage` | HTE-side evaluation |
| `/supervisor/messages` | `MessagesPage` | Communicate with students/coordinator |

---

## 🏫 5. SIPP Coordinator Flow

```mermaid
flowchart TD
    A[SIPP Dashboard] --> B{Modules}
    
    B --> C[Students - SIPP Assignments]
    B --> D[HTE Partners]
    B --> E[Evaluations]
    B --> F[Site Visits]
    B --> G[Messages]
    
    subgraph C1 [SIPP Student Management]
        C --> C1a[View SIPP Student List]
        C1a --> C1b[Assign Students to SIPP HTEs]
    end
    
    subgraph E1 [SIPP Evaluations]
        E --> E1a[View Evaluation List]
        E1a --> E1b[Evaluate SIPP Students]
        E1b --> E1c[Coordinator Rating]
    end
```

### SIPP Routes:
| Path | Component | Description |
|------|-----------|-------------|
| `/sipp/dashboard` | `SippDashboard` | SIPP-specific dashboard |
| `/sipp/students` | `AssignmentsPage` | Manage SIPP student assignments |
| `/sipp/htes` | `HTEsPage` | SIPP HTE partners |
| `/sipp/evaluations` | `EvaluationsPage` | SIPP evaluations |
| `/sipp/visits` | `SiteVisitsPage` | SIPP site visits |
| `/sipp/messages` | `MessagesPage` | Messaging |

---

## 🗄️ 6. Database Schema Flow

```mermaid
erDiagram
    users ||--o{ intern_assignments : "student"
    users ||--o{ intern_assignments : "coordinator"
    htes ||--o{ intern_assignments : "placement"
    colleges ||--o{ users : "belongs_to"
    colleges ||--o{ htes : "belongs_to"
    
    intern_assignments ||--o{ attendance : "has"
    intern_assignments ||--o{ accom_reports : "has"
    intern_assignments ||--o{ tasks : "has"
    intern_assignments ||--o{ requirements : "has"
    intern_assignments ||--o{ evaluations : "has"
    
    users ||--o{ tasks : "supervisor"
    users ||--o{ evaluations : "evaluator"
    users ||--o{ messages : "sender"
    users ||--o{ messages : "receiver"
    
    requirement_types ||--o{ requirements : "type"
    
    evaluations ||--o{ eval_scores : "scores"
    
    intern_assignments {
        bigint id PK
        bigint student_id FK
        bigint hte_id FK
        bigint coordinator_id FK
        bigint college_id FK
        string status "active | completed | cancelled | pull_out"
        date start_date
        date end_date
    }
```

---

## 🌐 7. API Data Flow

```mermaid
flowchart LR
    A[React Frontend] --> B[tRPC Client]
    B --> C[Hono HTTP Server]
    C --> D[Router Layer]
    
    D --> E1[auth.*]
    D --> E2[user.*]
    D --> E3[attendance.*]
    D --> E4[report.*]
    D --> E5[task.*]
    D --> E6[evaluation.*]
    D --> E7[message.*]
    D --> E8[siteVisit.*]
    D --> E9[hte.*]
    D --> E10[assignment.*]
    
    E1 --> F[Middleware: Session Check]
    E2 --> F
    E3 --> F
    E4 --> F
    E5 --> F
    E6 --> F
    E7 --> F
    E8 --> F
    E9 --> F
    E10 --> F
    
    F --> G[Drizzle ORM]
    G --> H[MySQL Database]
```

### tRPC Router Structure:
```
appRouter
├── ping              # Health check
├── auth              # Login, logout, me
├── user              # User CRUD
├── attendance        # DTR: list, create, update, delete, getToday, getSummary, timeIn, timeOut
├── report            # Accomplishment reports CRUD + review
├── task              # Tasks: list, create, update status
├── evaluation        # Evaluations: list, create, scores, AI summary
├── message           # Messaging: send, list conversations, get thread
├── siteVisit         # Site visits: list, create, update status
├── hte               # HTE partners: list, create
└── assignment        # Intern assignments: list, create, pull-out
```

---

## 📱 8. Navigation & Sidebar Menu Flow

```mermaid
flowchart TD
    A[App Root] --> B{DashboardLayout}
    B --> C[Sidebar + Header]
    B --> D[Main Content Area]
    
    C --> E{User Role}
    E -->|student| F1[Dashboard, DTR, Reports, Tasks]
    E -->|coordinator| F2[Dashboard, Students, DTR, Reports, Tasks, Evaluations, Site Visits, HTEs, Pull-Outs]
    E -->|supervisor| F3[Dashboard, Tasks, Evaluations]
    E -->|sipp_coordinator| F4[Dashboard, Students, HTEs, Evaluations, Site Visits]
    E -->|admin| F2
    
    F1 --> G[ProtectedRoute]
    F2 --> G
    F3 --> G
    F4 --> G
    G -->|Not Authorized| H[Navigate to /]
```

---

## 📋 9. Component Data Dependencies

| Page | tRPC Queries | tRPC Mutations | Key State |
|------|-------------|----------------|-----------|
| `DTRPage` | `attendance.list`, `attendance.getToday`, `attendance.getInternshipProgress`, `attendance.getSupervisorRemarks`, `attendance.coordinatorList`, `attendance.getCoordinatorStats`, `attendance.getStudentAttendance` | `attendance.create`, `attendance.update`, `attendance.delete`, `attendance.timeIn`, `attendance.timeOut` | `selMonth`, `dialogOpen`, `editId`, `formData`, `searchTerm`, `filterStatus` |
| `ReportsPage` | `report.list`, `report.studentReports` | `report.create`, `report.updateStatus`, `report.addRemarks` | `selMonth`, `dialogOpen`, `reviewOpen`, `searchTerm`, `filterStatus`, `filterStudent`, `dateRange` |
| `TasksPage` | `task.list` | `task.create`, `task.update` | `open`, `formData` |
| `EvaluationsPage` | `evaluation.list`, `evaluation.getCriteria` | `evaluation.create`, `evaluation.submitScore` | Tab selection, rating state, dialog open |
| `MessagesPage` | `message.listConversations`, `message.getThread` | `message.send` | `selectedPartner`, `messageInput` |
| `SiteVisitsPage` | `siteVisit.list` | `siteVisit.create` | `open`, `formData` |
| `HTEsPage` | `hte.list` | `hte.create` | `open`, `formData` |
| `AssignmentsPage` | `assignment.list` | `assignment.create` | `open`, `formData` |
| `PullOutMonitoring` | `assignment.list`, `assignment.pullOutList`, `assignment.pullOutCount` | `assignment.pullOutStudent` | `searchTerm`, `pullOutReason` |

---

## ⚙️ 10. Key Business Rules Flow

### DTR Computation:
```
AM Hours = AM Departure - AM Arrival
PM Hours = PM Departure - PM Arrival
Total Daily Hours = AM Hours + PM Hours
Late Minutes = max(0, AM Arrival - 08:00)
Monthly Total = Sum of all daily hours
Attendance Rate = (Present Days / Total Weekdays) × 100
```

### Time In / Time Out Flow:
```
Time In  → Auto-sets AM Arrival to current time (HH:MM)
Time Out → Auto-sets PM Departure to current time (HH:MM)
           If no AM Arrival yet, also sets AM Arrival
           Auto-computes undertime
           Status auto-set to "present" or "late"
```

### Evaluation Scoring:
```
Per Criteria Rating: 1 (Lowest) to 5 (Highest)
Category Average = Sum of items / Number of items
Overall Rating = Average of all categories
HTE Weight + Coordinator Weight = Overall Grade
```

### Internship Progress:
```
Required Hours: 486 hours
Progress % = (Completed Hours / 486) × 100
Status: On Track (< 100%) → Completed (≥ 100%)
```

### Pull-Out Process:
```
Active Assignment → Coordinator Initiates Pull-Out → 
Enter Reason → Status Changes to "pull_out" → 
Student Re-assignable to New HTE