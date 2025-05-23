# Task Tracker

A modern web application for tracking software engineering tasks through a predefined workflow. Built with Next.js, TypeScript, Shadcn UI, and Prisma with SQLite.

## Features

- Create and manage tasks with detailed descriptions
- Track tasks through customized workflow stages:
  - Investigation
  - Planning
  - In Progress
  - In Testing
  - In Review
  - Done
- Add notes at each stage transition
- Complete PR checklist items during review stage
- Filter and search tasks by status or keywords
- Persistent storage with SQLite database

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI Components**: Shadcn UI (built on Radix UI)
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite
- **Form Handling**: React Hook Form with Zod validation

## Development Guidelines

- [Commit Message Guidelines](./docs/commit-message-guide.md) - Follow these rules when creating commit messages

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up the database:

```bash
npm run db:push
npm run db:seed
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
├── docs/                # Documentation
│   ├── next-planning.md           # Feature planning
│   ├── reorganization-summary.md   # Project cleanup summary
│   ├── task-processing-rules.md    # Development process rules
│   └── task-completion-checklist.md # Task verification template
├── prisma/               # Database schema and seeds
├── public/               # Static assets
└── src/
    ├── app/              # Next.js App Router
    │   ├── api/          # API routes
    │   └── page.tsx      # Main page
    ├── components/       # React components
    │   ├── ui/           # Shadcn UI components
    │   └── ...           # Task-specific components
    └── lib/              # Utility functions and types
```

## Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Prisma Studio UI

## Development Process

This project follows a structured development process to ensure quality and consistency:

1. **Planning**: Before implementation, check `docs/next-planning.md` for feature requirements
2. **Implementation**: Follow TypeScript and Shadcn UI best practices
3. **Testing**: Verify functionality immediately after implementation
4. **Documentation**: Update planning documents after task completion
5. **Self-improvement**: Document challenges, solutions, and lessons learned

For detailed process information, see:

- [Task Processing Rules](./docs/task-processing-rules.md)
- [Task Completion Checklist](./docs/task-completion-checklist.md)
