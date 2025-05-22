import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="container mx-auto py-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[350px] mt-2" />
      </div>
      
      {/* Task summary skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-12 mt-2" />
          </div>
        ))}
      </div>
      
      {/* Kanban board skeleton */}
      <div className="flex space-x-4 pb-8 overflow-x-auto snap-x">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="flex flex-col h-full w-[280px] min-w-[280px] border rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 border-b bg-card">
              <Skeleton className="h-6 w-24 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto mt-1" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
              {Array(3).fill(null).map((_, j) => (
                <Skeleton key={j} className="h-24 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
