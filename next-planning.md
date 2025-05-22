# Task Tracker Web Application - Planning (Next.js Version)

## Overview

A modern web application to track software engineering tasks through predefined stages with status tracking and notes, built with Next.js, TypeScript, Shadcn UI, and a database for persistence.

## User Stories

1. As a user, I want to create new tasks with descriptions
2. As a user, I want to view all my tasks at a glance
3. As a user, I want to update the status of tasks (Investigation, Planning, In Progress, In Testing, In Review, Done)
4. As a user, I want to add notes for each status change
5. As a user, I want to complete a PR checklist for tasks in the review stage
6. As a user, I want to filter/search tasks based on status or text
7. As a user, I want data to persist in a database
8. As a user, I want a clean, intuitive UI that's easy to use

## Technical Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Shadcn UI (built on Radix UI)
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (for simple local development)
- **State Management**: React Context API or Zustand
- **Form Handling**: React Hook Form with Zod validation

## Features Breakdown

### 1. Project Setup ✅

- [x] Initialize Next.js project with TypeScript
- [x] Set up Shadcn UI components
- [x] Configure Tailwind CSS
- [x] Set up Prisma with SQLite database
- [x] Create database schema for tasks

### 2. Task Creation ✅

- [x] Design and implement task creation form with Shadcn components
- [x] Set up form validation with React Hook Form and Zod
- [x] Create API endpoint for storing new tasks
- [x] Connect form to database through API

### 3. Task Display ✅

- [x] Create a dashboard layout with Shadcn components
- [x] Implement task card components with status indicators
- [x] Create server component to fetch tasks from database
- [x] Implement responsive design with Tailwind

### 4. Task Status Management ✅

- [x] Create status update dialog/form components
- [x] Implement status progression logic (enforcing the correct order)
- [x] Create API endpoints for updating task status
- [x] Implement optimistic UI updates

### 5. Notes System ✅

- [x] Add note input fields in status change dialogs
- [x] Store notes with timestamps and associated status in database
- [x] Design and implement task history timeline component
- [x] Implement validation to require notes before status change

### 6. PR Checklist ✅

- [x] Create database schema for PR checklist items
- [x] Implement checklist UI components for the review stage
- [x] Create API for updating checklist items
- [x] Add validation requiring all items to be checked before completion

### 7. Filtering & Search ✅

- [x] Create filter components using Shadcn UI
- [x] Implement server-side or client-side search functionality
- [x] Design and implement filter reset options
- [ ] Add URL query parameters for sharing filtered views

### 8. Database Integration ✅

- [x] Complete Prisma schema for all entities
- [x] Create migrations and seed data
- [x] Implement API routes for all CRUD operations
- [x] Add error handling for database operations

### 9. UI/UX Enhancements 🔄

- [ ] Create dark/light mode toggle
- [x] Add loading states and skeletons
- [ ] Implement toast notifications for actions
- [x] Add animations and transitions

### 10. Deployment & Optimization 🔄

- [ ] Set up proper environment variables
- [ ] Optimize for production
- [ ] Implement proper error boundaries
- [ ] Add SEO optimization

## Database Schema (Prisma)

```prisma
// Schema implemented as per the plan
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

enum TaskStatus {
  INVESTIGATION
  PLANNING
  IN_PROGRESS
  IN_TESTING
  IN_REVIEW
  DONE
}

model Task {
  id            String          @id @default(uuid())
  title         String
  description   String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  status        TaskStatus      @default(INVESTIGATION)
  statusHistory StatusHistory[]
  prChecklist   PRChecklistItem[]
}

model StatusHistory {
  id        String     @id @default(uuid())
  status    TaskStatus
  note      String
  createdAt DateTime   @default(now())
  taskId    String
  task      Task       @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model PRChecklistItem {
  id        String   @id @default(uuid())
  label     String
  checked   Boolean  @default(false)
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Project Structure Refactoring ✅

The project structure has been reorganized to eliminate redundant files and the nested nextjs-app folder:

1. Removed the nested `nextjs-app` directory
2. Updated file paths to maintain correct references
3. Ensured Prisma schema and database connections are properly configured

## Implementation Plan

1. Project setup and tooling configuration - ✅
2. Database schema design and setup - ✅
3. UI component setup with Shadcn - ✅
4. Basic task CRUD operations - ✅
5. Status management system - ✅
6. Notes and history system - ✅
7. PR checklist functionality - ✅
8. Search and filtering capabilities - ✅
9. UI/UX refinement - 🔄
10. Testing and deployment - 🔄

## Progress Tracking

- [x] Next.js project initialization
- [x] Shadcn UI setup
- [x] Prisma database configuration
- [x] Task model and schema implementation
- [x] Task creation functionality
- [x] Task listing and dashboard
- [x] Status management implementation
- [x] Notes system implementation
- [x] PR checklist implementation
- [x] Search and filter functionality
- [x] UI/UX refinement (core components)
- [x] Project structure reorganization
- [ ] Dark/light mode toggle implementation
- [ ] Toast notifications for actions
- [ ] URL query parameters for sharing filtered views
- [ ] Additional UI/UX refinement
- [ ] Testing and bug fixing
- [ ] Production optimization

## Remaining Tasks

### 1. UI/UX Enhancements

- [ ] Implement dark/light mode toggle with Tailwind and localStorage
- [ ] Add toast notifications for task actions (create/update/delete)

### 2. Features Enhancements

- [ ] Add URL query parameters for sharing filtered views
- [ ] Implement task priority levels

### 3. Deployment & Optimization

- [ ] Set up proper environment variables
- [ ] Optimize for production
- [ ] Implement proper error boundaries
- [ ] Add SEO optimization

## Conclusion

The Task Tracker application has been successfully migrated to Next.js with TypeScript, Shadcn UI components, and a local database. The core functionality is complete, with a few enhancements still pending for optimal user experience and production readiness.
