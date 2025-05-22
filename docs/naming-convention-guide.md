# Naming Convention Guide

This document outlines the naming conventions used in the Task Tracker application to ensure consistency across the codebase.

## File Naming Conventions

### Components

- All component files use **kebab-case** (e.g., `task-card.tsx`, `create-task-dialog.tsx`)
- Components are placed in the `src/components` directory
- UI component wrappers are placed in `src/components/ui`

### Hooks

- Custom hook files use **kebab-case** with a `use-` prefix (e.g., `use-task-filter-params.ts`, `use-task-updates.ts`)
- Hooks are placed in the `src/lib` directory

### Utility Files

- Utility files use **camelCase** (e.g., `utils.ts`, `types.ts`, `prisma.ts`)
- Utilities are placed in the `src/lib` directory

## Function Naming Conventions

### Components

- React components use **PascalCase** (e.g., `TaskCard`, `CreateTaskDialog`)
- Component props interfaces use **PascalCase** with a `Props` suffix (e.g., `TaskCardProps`)

### Hooks

- Hook functions use **camelCase** with a `use` prefix (e.g., `useTaskFilterParams`, `useTaskUpdates`)
- Note that while hook function names use camelCase, their containing files use kebab-case (e.g., the `useTaskUpdates` function is in `use-task-updates.ts`)

### Utility Functions

- Utility functions use **camelCase** (e.g., `formatStatus`, `getStatusVariant`, `getNextStatus`)

### Enums

- Enum types use **PascalCase** (e.g., `TaskStatus`)
- Enum values use **SCREAMING_SNAKE_CASE** (e.g., `TaskStatus.IN_PROGRESS`)

## Code Organization Principles

1. **Centralization**: Common utilities, especially those used across multiple components, are centralized in `utils.ts`
2. **No Duplication**: Avoid duplicate implementations of the same functionality
3. **Consistent Imports**: Use consistent import patterns, with `@/` alias for project imports
4. **Clear Documentation**: Add JSDoc comments to explain non-obvious functions

## Status Utility Functions

Status-related formatting and styling functions have been centralized in `utils.ts`:

1. `formatStatus`: Converts `TaskStatus` enum values to human-readable strings
2. `getStatusVariant`: Returns appropriate badge variants for different statuses
3. `getStatusColor`: Returns Tailwind CSS classes for Kanban column styling
4. `getNextStatus`: Determines the next status in the workflow sequence

## Custom Hooks Organization

Task-related hooks have been organized consistently:

1. `use-task-filter-params.ts`: Manages URL parameters for filtering
2. `use-task-filtering.ts`: Handles filtering logic with URL integration
3. `use-task-updates.ts`: Manages data refreshing with auto-refresh functionality
4. `use-toast.ts`: Provides toast notification capabilities

This naming convention ensures better code organization, easier maintenance, and helps new developers understand the codebase structure more quickly.
