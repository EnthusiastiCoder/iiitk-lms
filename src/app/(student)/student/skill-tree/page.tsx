import { Route } from "lucide-react";

export default function SkillTree() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-brand/10">
          <Route className="h-6 w-6 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Skill Tree</h1>
          <p className="text-muted-foreground">
            Interactive skill tree coming soon...
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border">
        <div className="text-center space-y-2">
          <Route className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            Under Construction
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-sm">
            The interactive skill tree will map your learning journey and show
            how skills connect across courses.
          </p>
        </div>
      </div>
    </div>
  );
}
