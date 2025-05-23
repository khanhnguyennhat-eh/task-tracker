# Task Tracker Database Troubleshooting Guide

If you encounter the "Table `main.Task` does not exist" error or other database synchronization issues, follow these steps to fix the problem:

## Quick Fix

Run the following command to quickly reset and fix the database:

```bash
npm run db:fix
```

This will:

1. Delete the existing SQLite database file
2. Push the current Prisma schema to create a new database
3. Seed the database with basic task data

## Alternative Solutions

### 1. Use Prisma Reset and Seed

```bash
npm run db:reset
```

This uses the built-in Prisma commands to reset and seed the database.

### 2. Manual Database Reset

If the above methods don't work, you can try these manual steps:

1. Stop the development server
2. Delete the `prisma/dev.db` file
3. Run `npx prisma db push --force-reset`
4. Run `npx prisma generate` to update the Prisma client
5. Run `npm run dev` to start the development server
6. Access `http://localhost:3000/api/seed` in your browser to add a sample task

### 3. Use Prisma Studio

Prisma Studio provides a visual interface to manage your database:

```bash
npm run db:studio
```

## Preventing Future Issues

- When making schema changes, always use `prisma db push` to update the database
- For production environments, consider using Prisma Migrate for proper versioning
- Back up your database regularly
- Consider implementing database health checks in your application startup
