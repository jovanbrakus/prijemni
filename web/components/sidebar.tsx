"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { FacultyEntry, Report, LessonEntry } from "@/lib/types";

interface SidebarProps {
  faculties: FacultyEntry[];
  facultiesV2: FacultyEntry[];
  reports: Report[];
  lessons: LessonEntry[];
  selectedProblemId: string | null;
  selectedLessonId: string | null;
  expandedFaculty: string | null;
  expandedYear: string | null;
  filterReported: boolean;
  onFilterReportedChange: (value: boolean) => void;
  onExpandFaculty: (slug: string | null) => void;
  onExpandYear: (year: string | null) => void;
  onSelectProblem: (id: string) => void;
  onSelectLesson: (lessonId: string) => void;
}

export function Sidebar({
  faculties,
  facultiesV2,
  reports,
  lessons,
  selectedProblemId,
  selectedLessonId,
  expandedFaculty,
  expandedYear,
  filterReported,
  onFilterReportedChange,
  onExpandFaculty,
  onExpandYear,
  onSelectProblem,
  onSelectLesson,
}: SidebarProps) {
  const [lessonsExpanded, setLessonsExpanded] = useState(!!selectedLessonId);
  const [v2Expanded, setV2Expanded] = useState(!!selectedProblemId?.startsWith("v2_"));
  const [expandedFacultyV2, setExpandedFacultyV2] = useState<string | null>(null);
  const [expandedYearV2, setExpandedYearV2] = useState<string | null>(null);
  // Build a set for O(1) report lookups
  const reportSet = new Set(reports.map((r) => r.problemId));

  const hasReport = (problemId: string) => reportSet.has(problemId);

  // Count reports per faculty/year
  const facultyReportCounts = new Map<string, number>();
  const yearReportCounts = new Map<string, number>();
  for (const faculty of faculties) {
    let facultyCount = 0;
    for (const year of faculty.years) {
      const yearKey = `${year.year}:${year.extra || ""}`;
      let yearCount = 0;
      for (const p of year.problems) {
        if (hasReport(p.id)) {
          yearCount++;
        }
      }
      if (yearCount > 0) {
        yearReportCounts.set(`${faculty.slug}:${yearKey}`, yearCount);
        facultyCount += yearCount;
      }
    }
    if (facultyCount > 0) {
      facultyReportCounts.set(faculty.slug, facultyCount);
    }
  }

  // Filter faculties/years when filter is active
  const visibleFaculties = filterReported
    ? faculties
        .filter((f) => facultyReportCounts.has(f.slug))
        .map((f) => ({
          ...f,
          years: f.years
            .filter((y) =>
              yearReportCounts.has(`${f.slug}:${y.year}:${y.extra || ""}`)
            )
            .map((y) => ({
              ...y,
              problems: y.problems.filter((p) =>
                hasReport(p.id)
              ),
            })),
        }))
    : faculties;

  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        {/* Logo & title */}
        <div className="flex items-center gap-3 px-3 py-2">
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
        </div>

        <div className="my-2 border-t border-white/10" />

        {/* Filter toggle */}
        {reports.length > 0 && (
          <>
            <button
              onClick={() => onFilterReportedChange(!filterReported)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
                filterReported
                  ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Reported problems</span>
              <Badge
                variant="secondary"
                className={cn(
                  "ml-auto shrink-0 text-[10px]",
                  filterReported && "bg-amber-500/20 text-amber-400"
                )}
              >
                {reports.length}
              </Badge>
            </button>

            <div className="my-2 border-t border-white/10" />
          </>
        )}

        {visibleFaculties.map((faculty) => {
          const isExpanded = filterReported || expandedFaculty === faculty.slug;
          const totalProblems = faculty.years.reduce(
            (sum, y) => sum + y.problems.length,
            0
          );
          const reportCount = facultyReportCounts.get(faculty.slug);

          return (
            <div key={faculty.slug} className="mb-1">
              <button
                onClick={() =>
                  filterReported ? undefined : onExpandFaculty(isExpanded ? null : faculty.slug)
                }
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isExpanded
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
                <span className="truncate">{faculty.displayName}</span>
                {reportCount && !filterReported && (
                  <span className="ml-auto mr-1 shrink-0 text-[10px] font-medium text-amber-400">
                    {reportCount}
                  </span>
                )}
                <Badge
                  variant="secondary"
                  className={cn("shrink-0 text-[10px]", !reportCount && "ml-auto")}
                >
                  {totalProblems}
                </Badge>
              </button>

              {isExpanded && (
                <div className="ml-3 mt-1">
                  {faculty.years.map((yearEntry) => {
                    const yearKey = `${yearEntry.year}:${yearEntry.extra || ""}`;
                    const isYearExpanded = filterReported || expandedYear === yearKey;
                    const yearReportCount = yearReportCounts.get(
                      `${faculty.slug}:${yearKey}`
                    );

                    return (
                      <div key={yearKey} className="mb-0.5">
                        <button
                          onClick={() =>
                            filterReported ? undefined : onExpandYear(
                              isYearExpanded ? null : yearKey
                            )
                          }
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isYearExpanded
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 shrink-0 transition-transform",
                              isYearExpanded && "rotate-90"
                            )}
                          />
                          <span>{yearEntry.label}</span>
                          {yearReportCount && !filterReported && (
                            <span className="text-[10px] font-medium text-amber-400">
                              {yearReportCount}
                            </span>
                          )}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {yearEntry.problems.length}
                          </span>
                        </button>

                        {isYearExpanded && (
                          <div className="ml-4 mt-0.5">
                            {yearEntry.problems.map((problem) => {
                              const isActive = selectedProblemId === problem.id;
                              const isReported = hasReport(problem.id);

                              return (
                                <button
                                  key={problem.id}
                                  onClick={() => onSelectProblem(problem.id)}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-3 py-1 text-left text-xs transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    isActive
                                      ? "border-l-2 border-primary bg-primary/10 text-foreground"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {isReported && (
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                                  )}
                                  <span className="font-medium">
                                    {problem.order}.
                                  </span>
                                  {problem.categorySr && (
                                    <span className="truncate text-[10px] text-muted-foreground">
                                      {problem.categorySr}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Lekcije section */}
        {lessons.length > 0 && !filterReported && (
          <>
            <div className="my-2 border-t border-white/10" />

            <div className="mb-1">
              <button
                onClick={() => setLessonsExpanded(!lessonsExpanded)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  lessonsExpanded ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    lessonsExpanded && "rotate-90"
                  )}
                />
                <span className="truncate">Lekcije</span>
                <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                  {lessons.length}
                </Badge>
              </button>

              {lessonsExpanded && (
                <div className="ml-3 mt-1">
                  {lessons.map((lesson) => {
                    const isActive = selectedLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-3 py-1 text-left text-xs transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "border-l-2 border-primary bg-primary/10 text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Problems v2 section */}
        {facultiesV2.length > 0 && !filterReported && (
          <>
            <div className="my-2 border-t border-white/10" />

            <div className="mb-1">
              <button
                onClick={() => setV2Expanded(!v2Expanded)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  v2Expanded ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    v2Expanded && "rotate-90"
                  )}
                />
                <span className="truncate">Rešenja v2</span>
                <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                  {facultiesV2.reduce((sum, f) => sum + f.years.reduce((s, y) => s + y.problems.length, 0), 0)}
                </Badge>
              </button>

              {v2Expanded && (
                <div className="ml-1 mt-1">
                  {facultiesV2.map((faculty) => {
                    const isExpanded = expandedFacultyV2 === faculty.slug;
                    const totalProblems = faculty.years.reduce(
                      (sum, y) => sum + y.problems.length, 0
                    );

                    return (
                      <div key={`v2_${faculty.slug}`} className="mb-0.5">
                        <button
                          onClick={() => {
                            setExpandedFacultyV2(isExpanded ? null : faculty.slug);
                            setExpandedYearV2(null);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isExpanded ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 shrink-0 transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                          <span className="truncate">{faculty.displayName}</span>
                          <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                            {totalProblems}
                          </Badge>
                        </button>

                        {isExpanded && (
                          <div className="ml-3 mt-0.5">
                            {faculty.years.map((yearEntry) => {
                              const yearKey = `${yearEntry.year}:${yearEntry.extra || ""}`;
                              const isYearExpanded = expandedYearV2 === yearKey;

                              return (
                                <div key={yearKey} className="mb-0.5">
                                  <button
                                    onClick={() => setExpandedYearV2(isYearExpanded ? null : yearKey)}
                                    className={cn(
                                      "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors",
                                      "hover:bg-accent hover:text-accent-foreground",
                                      isYearExpanded ? "text-foreground" : "text-muted-foreground"
                                    )}
                                  >
                                    <ChevronRight
                                      className={cn(
                                        "h-3 w-3 shrink-0 transition-transform",
                                        isYearExpanded && "rotate-90"
                                      )}
                                    />
                                    <span>{yearEntry.label}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      {yearEntry.problems.length}
                                    </span>
                                  </button>

                                  {isYearExpanded && (
                                    <div className="ml-4 mt-0.5">
                                      {yearEntry.problems.map((problem) => {
                                        const isActive = selectedProblemId === problem.id;
                                        return (
                                          <button
                                            key={problem.id}
                                            onClick={() => onSelectProblem(problem.id)}
                                            className={cn(
                                              "flex w-full items-center gap-2 rounded-md px-3 py-1 text-left text-xs transition-colors",
                                              "hover:bg-accent hover:text-accent-foreground",
                                              isActive
                                                ? "border-l-2 border-emerald-500 bg-emerald-500/10 text-foreground"
                                                : "text-muted-foreground"
                                            )}
                                          >
                                            <span className="font-medium">
                                              {problem.order}.
                                            </span>
                                            {problem.categorySr && (
                                              <span className="truncate text-[10px] text-muted-foreground">
                                                {problem.categorySr}
                                              </span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
