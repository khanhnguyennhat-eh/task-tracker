import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-foreground">Task Tracker</h1>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
