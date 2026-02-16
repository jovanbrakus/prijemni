import { BookOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="rounded-xl border border-white/10 bg-card/50 p-12 text-center backdrop-blur">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Arhiva Rešenja
        </h2>
        <p className="text-sm text-muted-foreground">
          Izaberite zadatak iz menija sa leve strane.
        </p>
      </div>
    </div>
  );
}
