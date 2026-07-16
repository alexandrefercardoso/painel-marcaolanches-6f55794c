import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CompanyFormSkeleton() {
  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-transparent to-transparent border-b border-primary/5 pb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-[220px] w-full rounded-3xl" />
              <Skeleton className="h-[150px] w-full rounded-3xl" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-primary/5">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-12 col-span-2" />
                <Skeleton className="h-12" />
              </div>
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
