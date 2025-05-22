import Link from 'next/link';
import { ThemeToggle } from "./theme-toggle";
import { KanbanSquare, ListTodo, Settings, HelpCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  return (
    <header className="border-b bg-background shadow-sm sticky top-0 z-10">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <KanbanSquare className="h-5 w-5 text-primary" />
            <h1 className="text-md font-bold text-foreground">Task Tracker</h1>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-1 text-sm">
          <Link 
            href="/" 
            className={`px-4 py-2 rounded-md flex items-center space-x-1.5 ${
              pathname === '/' 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-muted/60 text-muted-foreground'
            }`}
          >
            <KanbanSquare className="h-4 w-4" />
            <span>Board</span>
          </Link>
          <Link 
            href="/list" 
            className={`px-4 py-2 rounded-md flex items-center space-x-1.5 ${
              pathname === '/list' 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-muted/60 text-muted-foreground'
            }`}
          >
            <ListTodo className="h-4 w-4" />
            <span>List</span>
          </Link>
          <Link 
            href="/settings" 
            className={`px-4 py-2 rounded-md flex items-center space-x-1.5 ${
              pathname === '/settings' 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-muted/60 text-muted-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Link 
            href="/help" 
            className={`px-4 py-2 rounded-md flex items-center space-x-1.5 ${
              pathname === '/help' 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-muted/60 text-muted-foreground'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
