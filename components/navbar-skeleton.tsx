import { Type } from "lucide-react";

export default function NavbarSkeleton() {
  return (
    <div className="sticky top-0 z-50 border-b-2 border-border bg-secondary-background px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-heading font-bold">
          <Type className="h-5 w-5" />
          Contact!
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 border-2 border-border bg-background" />
          <div className="h-9 w-24 border-2 border-border bg-background" />
        </div>
      </div>
    </div>
  );
}
