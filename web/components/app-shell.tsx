"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ProblemViewer } from "./problem-viewer";
import { cn } from "@/lib/utils";
import type { FacultyEntry } from "@/lib/types";

function AppShellInner({ faculties }: { faculties: FacultyEntry[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedFaculty = searchParams.get("faculty");
  const selectedYear = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : null;
  const selectedProblem = searchParams.get("problem")
    ? Number(searchParams.get("problem"))
    : null;

  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(
    selectedFaculty
  );
  const [expandedYear, setExpandedYear] = useState<number | null>(selectedYear);

  const solutionUrl = useMemo(() => {
    if (!selectedFaculty || !selectedYear || !selectedProblem) return null;
    const faculty = faculties.find((f) => f.slug === selectedFaculty);
    if (!faculty) return null;
    const year = faculty.years.find((y) => y.year === selectedYear);
    if (!year) return null;
    const problem = year.problems.find((p) => p.order === selectedProblem);
    return problem?.solutionUrl ?? null;
  }, [faculties, selectedFaculty, selectedYear, selectedProblem]);

  const handleSelectProblem = useCallback(
    (faculty: string, year: number, order: number) => {
      const params = new URLSearchParams();
      params.set("faculty", faculty);
      params.set("year", String(year));
      params.set("problem", String(order));
      router.push(`/?${params.toString()}`, { scroll: false });
      setMobileOpen(false);
    },
    [router]
  );

  const handleExpandFaculty = useCallback((slug: string | null) => {
    setExpandedFaculty(slug);
    setExpandedYear(null);
  }, []);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-card px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Image
          src="/logo-56.png"
          alt="Logo"
          width={28}
          height={26}
          unoptimized
        />
        <h1 className="text-sm font-semibold text-foreground">
          Prijemni - Arhiva Rešenja
        </h1>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 border-r border-white/10 bg-card",
            "md:relative md:block md:w-[280px]",
            mobileOpen
              ? "fixed inset-y-14 left-0 z-30 w-[280px]"
              : "hidden md:block"
          )}
        >
          <Sidebar
            faculties={faculties}
            selectedFaculty={selectedFaculty}
            selectedYear={selectedYear}
            selectedProblem={selectedProblem}
            expandedFaculty={expandedFaculty}
            expandedYear={expandedYear}
            onExpandFaculty={handleExpandFaculty}
            onExpandYear={setExpandedYear}
            onSelectProblem={handleSelectProblem}
          />
        </aside>

        {/* Viewer */}
        <main className="min-h-0 flex-1">
          <ProblemViewer solutionUrl={solutionUrl} />
        </main>
      </div>
    </div>
  );
}

export function AppShell({ faculties }: { faculties: FacultyEntry[] }) {
  return (
    <Suspense>
      <AppShellInner faculties={faculties} />
    </Suspense>
  );
}
