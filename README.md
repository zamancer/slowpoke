# Slowpoke

A learning reinforcement platform for mastering concepts through short, focused study sessions. Built for DSA interview preparation, with plans to expand to other learning materials.

## Tech Stack

- **Framework**: TanStack Start
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Database**: Convex
- **UI Components**: Shadcn

## Getting Started

```bash
pnpm install
pnpm dev
```

## Building For Production

```bash
pnpm build
```

## Environment Setup

### Clerk (Authentication)
Set `VITE_CLERK_PUBLISHABLE_KEY` in your `.env.local`.

### Convex (Database)
Set `VITE_CONVEX_URL` and `CONVEX_DEPLOYMENT` in your `.env.local`, or run `npx convex init` to configure automatically. Then run `npx convex dev` to start the Convex server.

## Development

### Testing
```bash
pnpm test
```

### Linting & Formatting
```bash
pnpm lint
pnpm format
pnpm check
```

### Adding UI Components
```bash
pnpm dlx shadcn@latest add button
```
