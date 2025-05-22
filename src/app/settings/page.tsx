import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Task Tracker',
  description: 'Configure your Task Tracker settings and preferences',
};

export default function SettingsPage() {
  return (
    <main className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your preferences and application settings
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">User Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Default View
              </label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Kanban Board</option>
                <option>List View</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                Auto-refresh Interval
              </label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>5 seconds</option>
                <option>10 seconds</option>
                <option>30 seconds</option>
                <option>1 minute</option>
                <option>Off</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Task Updates</span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full border border-neutral-200 bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">
                <span className="absolute mx-0.5 h-5 w-5 rounded-full bg-white transition-transform translate-x-5" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status Changes</span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full border border-neutral-200 bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">
                <span className="absolute mx-0.5 h-5 w-5 rounded-full bg-white transition-transform translate-x-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded">
          Save Changes
        </button>
      </div>
    </main>
  );
}
