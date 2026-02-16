"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { FacultyEntry } from "@/lib/types";

interface SidebarProps {
  faculties: FacultyEntry[];
  selectedFaculty: string | null;
  selectedYear: number | null;
  selectedProblem: number | null;
  expandedFaculty: string | null;
  expandedYear: number | null;
  onExpandFaculty: (slug: string | null) => void;
  onExpandYear: (year: number | null) => void;
  onSelectProblem: (faculty: string, year: number, order: number) => void;
}

export function Sidebar({
  faculties,
  selectedFaculty,
  selectedYear,
  selectedProblem,
  expandedFaculty,
  expandedYear,
  onExpandFaculty,
  onExpandYear,
  onSelectProblem,
}: SidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        {faculties.map((faculty) => {
          const isExpanded = expandedFaculty === faculty.slug;
          const totalProblems = faculty.years.reduce(
            (sum, y) => sum + y.problems.length,
            0
          );

          return (
            <div key={faculty.slug} className="mb-1">
              <button
                onClick={() =>
                  onExpandFaculty(isExpanded ? null : faculty.slug)
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
                <Badge
                  variant="secondary"
                  className="ml-auto shrink-0 text-[10px]"
                >
                  {totalProblems}
                </Badge>
              </button>

              {isExpanded && (
                <div className="ml-3 mt-1">
                  {faculty.years.map((yearEntry) => {
                    const isYearExpanded = expandedYear === yearEntry.year;

                    return (
                      <div key={yearEntry.year} className="mb-0.5">
                        <button
                          onClick={() =>
                            onExpandYear(
                              isYearExpanded ? null : yearEntry.year
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
                          <span>{yearEntry.year}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {yearEntry.problems.length}
                          </span>
                        </button>

                        {isYearExpanded && (
                          <div className="ml-4 mt-0.5">
                            {yearEntry.problems.map((problem) => {
                              const isActive =
                                selectedFaculty === faculty.slug &&
                                selectedYear === yearEntry.year &&
                                selectedProblem === problem.order;

                              return (
                                <button
                                  key={problem.order}
                                  onClick={() =>
                                    onSelectProblem(
                                      faculty.slug,
                                      yearEntry.year,
                                      problem.order
                                    )
                                  }
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-3 py-1 text-left text-xs transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    isActive
                                      ? "border-l-2 border-primary bg-primary/10 text-foreground"
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
    </ScrollArea>
  );
}
