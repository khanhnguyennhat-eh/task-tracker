# URL Query Parameters Implementation Checklist

## Overview

This feature allows users to share filtered views of the Task Tracker by using URL query parameters. When a user applies filters, the URL is updated to reflect these filters, making it possible to bookmark or share specific views of the tasks.

## Implementation Goals

- [x] Create a utility hook for managing URL parameters
- [x] Implement reading query parameters from URL
- [x] Update URL when filters are applied
- [x] Preserve filter state on page refresh
- [x] Support search query parameter
- [x] Support status filter parameter
- [x] Clear parameters when filters are reset

## Implementation Details

### Query Parameters Used

- `q`: Search query text
- `status`: Task status filter (one of the TaskStatus enum values or absent for ALL)

### URL Examples

- All tasks: `/`
- Search for "bug": `/?q=bug`
- Show only "In Progress" tasks: `/?status=IN_PROGRESS`
- Search for "bug" in "In Progress" tasks: `/?q=bug&status=IN_PROGRESS`

### Components Modified

- `src/lib/use-task-filter-params.ts` (new file): Custom hook for managing URL parameters
- `src/components/kanban-board.tsx`: Updated to use and update URL parameters
- `src/components/task-grid.tsx`: Updated to use and update URL parameters

## Benefits

- Users can bookmark specific filtered views
- Users can share links to specific filtered views with team members
- Filter state persists across page refreshes
- Better user experience with synchronized UI and URL state

## Usage Instructions

1. Apply filters using the search box or status dropdown
2. The URL will automatically update to reflect your filters
3. Share the URL or bookmark it to save this view
4. When you visit a URL with query parameters, the filters will be applied automatically
