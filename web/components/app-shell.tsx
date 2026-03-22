"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ProblemViewer } from "./problem-viewer";
import { cn } from "@/lib/utils";
import type { FacultyEntry, Report, CategoryOption, LessonEntry } from "@/lib/types";

interface ProblemLocation {
  facultySlug: string;
  yearKey: string;
  problem: import("@/lib/types").ProblemEntry;
}

function AppShellInner({ faculties: initialFaculties, categoryOptions, lessons }: { faculties: FacultyEntry[]; categoryOptions: CategoryOption[]; lessons: LessonEntry[] }) {
  const [faculties, setFaculties] = useState(initialFaculties);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const selectedId = searchParams.get("id");
  const selectedLessonId = searchParams.get("lesson");

  // Build flat lookup: id → { facultySlug, year, problem }
  const problemIndex = useMemo(() => {
    const index = new Map<string, ProblemLocation>();
    for (const faculty of faculties) {
      for (const yearEntry of faculty.years) {
        const yearKey = `${yearEntry.year}:${yearEntry.extra || ""}`;
        for (const problem of yearEntry.problems) {
          index.set(problem.id, {
            facultySlug: faculty.slug,
            yearKey,
            problem,
          });
        }
      }
    }
    return index;
  }, [faculties]);

  const selectedLocation = selectedId ? problemIndex.get(selectedId) ?? null : null;
  const selectedEntry = selectedLocation?.problem ?? null;

  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(
    selectedLocation?.facultySlug ?? null
  );
  const [expandedYear, setExpandedYear] = useState<string | null>(
    selectedLocation?.yearKey ?? null
  );
  const [filterReported, setFilterReported] = useState(false);

  // Auto-expand sidebar when URL changes
  useEffect(() => {
    if (selectedLocation) {
      setExpandedFaculty(selectedLocation.facultySlug);
      setExpandedYear(selectedLocation.yearKey);
    }
  }, [selectedLocation]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {
      // silently fail — reports are non-critical
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId]
  );

  const solutionUrl = selectedLesson?.url ?? selectedEntry?.solutionUrl ?? null;
  const selectedDocument = selectedEntry?.document ?? null;

  const handleCategoryChange = useCallback(
    (newCategoryId: string | null) => {
      if (!selectedId) return;
      setFaculties((prev) =>
        prev.map((f) => ({
          ...f,
          years: f.years.map((y) => ({
            ...y,
            problems: y.problems.map((p) => {
              if (p.id !== selectedId) return p;
              const opt = categoryOptions.find((c) => c.id === newCategoryId);
              return {
                ...p,
                category: newCategoryId,
                categorySr: opt?.sr ?? null,
                categoryGroupId: opt?.groupId ?? null,
                categoryGroupSr: opt?.groupSr ?? null,
              };
            }),
          })),
        }))
      );
    },
    [selectedId, categoryOptions]
  );

  const currentReport = useMemo(() => {
    if (!selectedEntry) return null;
    return reports.find((r) => r.problemId === selectedEntry.id) ?? null;
  }, [reports, selectedEntry]);

  const handleSelectProblem = useCallback(
    (id: string) => {
      router.push(`/?id=${id}`, { scroll: false });
      setMobileOpen(false);
    },
    [router]
  );

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      router.push(`/?lesson=${lessonId}`, { scroll: false });
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
      {/* Mobile header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-card px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
            "md:relative md:block md:w-[360px]",
            mobileOpen
              ? "fixed inset-y-14 left-0 z-30 w-[360px]"
              : "hidden md:block"
          )}
        >
          <Sidebar
            faculties={faculties}
            reports={reports}
            lessons={lessons}
            selectedProblemId={selectedId}
            selectedLessonId={selectedLessonId}
            expandedFaculty={expandedFaculty}
            expandedYear={expandedYear}
            filterReported={filterReported}
            onFilterReportedChange={setFilterReported}
            onExpandFaculty={handleExpandFaculty}
            onExpandYear={setExpandedYear}
            onSelectProblem={handleSelectProblem}
            onSelectLesson={handleSelectLesson}
          />
        </aside>

        {/* Viewer */}
        <main className="min-h-0 flex-1">
          <ProblemViewer
            solutionUrl={solutionUrl}
            problemId={selectedLesson ? null : (selectedEntry?.id ?? null)}
            document={selectedLesson ? null : selectedDocument}
            order={selectedLesson ? null : (selectedEntry?.order ?? null)}
            category={selectedLesson ? null : (selectedEntry?.category ?? null)}
            categorySr={selectedLesson ? null : (selectedEntry?.categorySr ?? null)}
            categoryGroupSr={selectedLesson ? null : (selectedEntry?.categoryGroupSr ?? null)}
            categoryOptions={categoryOptions}
            report={selectedLesson ? null : currentReport}
            onReportChange={fetchReports}
            onCategoryChange={handleCategoryChange}
          />
        </main>
      </div>
    </div>
  );
}

export function AppShell({ faculties, categoryOptions, lessons }: { faculties: FacultyEntry[]; categoryOptions: CategoryOption[]; lessons: LessonEntry[] }) {
  return (
    <Suspense>
      <AppShellInner faculties={faculties} categoryOptions={categoryOptions} lessons={lessons} />
    </Suspense>
  );
}
