// file: README.md
# Personal Expense Tracker 📈

A production-ready, highly secure personal finance management application built for a single administrator. It features lightning-fast data entry, calendar-based heatmaps, cash flow tracking, and dynamic visual analytics.

## 🚀 Technology Stack
- **Framework:** Next.js 15 (App Router, React Server Components)
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Drizzle ORM
- **Authentication:** Auth.js v5 (Credentials Provider with bcryptjs)
- **Styling:** Tailwind CSS, shadcn/ui, next-themes (Dark Mode)
- **Forms & Validation:** React Hook Form, Zod
- **Tables & Charts:** TanStack Table, Recharts
- **Data Export:** xlsx (CSV/Excel)

---

## 🏗️ Architecture
This project uses a **Feature-Based Architecture** to ensure maintainability:
- `/app`: Next.js routing, layouts, and page components.
- `/features`: Domain-specific logic (`auth`, `expenses`, `transactions`, `meals`, `dashboard`, `calendar`, `reports`, `settings`). Each feature encapsulates its own components, actions, queries, and schemas.
- `/db`: Database schemas, relations, migrations, and seed scripts.
- `/lib`: Shared utilities, including strict minor-unit financial calculations to prevent floating-point errors.

