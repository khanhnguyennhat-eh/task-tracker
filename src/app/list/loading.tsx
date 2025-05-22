import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="container mx-auto py-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[350px] mt-2" />
      </div>
      
      {/* Task grid skeleton */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-9 w-[250px]" />
          <Skeleton className="h-9 w-[150px]" />
          <Skeleton className="h-9 w-[100px] ml-auto" />
        </div>
        
        <div className="bg-card rounded-md border overflow-hidden">
          <div className="p-3 border-b">
            <div className="grid grid-cols-12 gap-4">
              <Skeleton className="h-5 w-full col-span-6" />
              <Skeleton className="h-5 w-full col-span-2" />
              <Skeleton className="h-5 w-full col-span-2" />
              <Skeleton className="h-5 w-full col-span-2" />
            </div>
          </div>
          
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="grid grid-cols-12 gap-4">
                <Skeleton className="h-6 w-full col-span-6" />
                <Skeleton className="h-6 w-20 col-span-2" />
                <Skeleton className="h-6 w-24 col-span-2" />
                <Skeleton className="h-6 w-24 col-span-2" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-[200px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </main>
  );
}
