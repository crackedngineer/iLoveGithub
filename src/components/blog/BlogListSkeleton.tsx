import {Skeleton} from "@/components/ui/skeleton";

const BlogListSkeleton = () => {
  return (
    <div className="space-y-0 divide-y divide-border/50">
      {Array.from({length: 5}).map((_, index) => (
        <div
          key={index}
          className="py-6 animate-fade-in"
          style={{animationDelay: `${index * 50}ms`}}
        >
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-20" />
            <span className="text-border">•</span>
            <Skeleton className="h-4 w-16" />
          </div>

          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />

          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogListSkeleton;
