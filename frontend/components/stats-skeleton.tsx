"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="bg-white/80 dark:bg-white/10 backdrop-blur-lg">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

