# Theme Implementation Guide

This document explains how the dark/light mode theme system is implemented in the Task Tracker application.

## Overview

The theme system allows users to switch between light, dark, and system-preferred themes. The user's preference is saved in localStorage and persists between sessions.

## Implementation Details

### Key Components

1. **ThemeProvider** (`src/components/theme-provider.tsx`)

   - React context provider that manages theme state
   - Handles synchronization with localStorage
   - Listens for system preference changes
   - Applies the appropriate CSS classes to the document

2. **ThemeToggle** (`src/components/theme-toggle.tsx`)

   - UI component that allows users to change themes
   - Dropdown menu with options for light, dark, and system theme
   - Shows appropriate icon based on current theme

3. **Header** (`src/components/header.tsx`)
   - Contains the ThemeToggle component
   - Provides a consistent layout element across the app

### How It Works

1. The `ThemeProvider` wraps the entire application in `layout.tsx`
2. On initial load, it checks localStorage for a saved preference
3. If no preference exists, it uses the system default
4. The theme is applied by adding either `light` or `dark` class to the HTML element
5. Tailwind CSS uses these classes to apply the appropriate styles via CSS variables
6. When a user selects a new theme via the `ThemeToggle`:
   - The theme is saved to localStorage
   - The CSS class on the HTML element is updated
   - Components re-render with the new theme

## Using the Theme System

### Accessing the Current Theme

To access or change the theme in any component:

```tsx
import { useTheme } from "@/components/theme-provider";

function MyComponent() {
  const { theme, setTheme } = useTheme();

  // Access current theme
  console.log(theme); // "light", "dark", or "system"

  // Change theme programmatically
  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    // Component content
  );
}
```

### Theme-Specific Styling

The Tailwind CSS `dark:` variant can be used to apply styles specifically for dark mode:

```tsx
<div className="bg-white text-black dark:bg-gray-800 dark:text-white">
  This text will be black on white in light mode, and white on dark gray in dark
  mode.
</div>
```

## Adding New Theme Settings

To add new colors or styles to the theme system:

1. Add the variables to both light and dark themes in `globals.css`
2. Use the variables in your components with Tailwind's `bg-background`, etc.

## Troubleshooting

**Hydration Errors**: If you encounter hydration errors, ensure that components that use `useTheme()` are client components (marked with "use client" directive).

**Theme Flickering**: To prevent theme flickering during page load, the `suppressHydrationWarning` attribute is added to the HTML element.
