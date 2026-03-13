"use client";

import { useState } from "react";
import { Flag, Eye, EyeOff, Check, Loader2, AlertCircle, Tag, ChevronDown } from "lucide-react";
import { EmptyState } from "./empty-state";
import type { Report, CategoryOption } from "@/lib/types";

interface ProblemViewerProps {
  solutionUrl: string | null;
  document: string | null;
  order: number | null;
  category: string | null;
  categorySr: string | null;
  categoryGroupSr: string | null;
  categoryOptions: CategoryOption[];
  report: Report | null;
  onReportChange: () => void;
  onCategoryChange: (categoryId: string | null) => void;
}

export function ProblemViewer({
  solutionUrl,
  document,
  order,
  category,
  categorySr,
  categoryGroupSr,
  categoryOptions,
  report,
  onReportChange,
  onCategoryChange,
}: ProblemViewerProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  if (!solutionUrl) {
    return <EmptyState />;
  }

  const handleSubmitReport = async () => {
    if (!description.trim() || !document || !order) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, order, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }
      setShowForm(false);
      setDescription("");
      onReportChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkFixed = async () => {
    if (!document || !order) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, order }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as fixed");
      }
      setShowDescription(false);
      onReportChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as fixed");
    } finally {
      setSubmitting(false);
    }
  };

  const [pendingCategory, setPendingCategory] = useState<string | null | undefined>(undefined);

  const handleCategorySelect = (newCategory: string | null) => {
    if (!document || !order) return;
    if (newCategory === category) {
      setShowCategoryDropdown(false);
      return;
    }
    setPendingCategory(newCategory);
    setShowCategoryDropdown(false);
  };

  const handleConfirmCategory = async () => {
    if (pendingCategory === undefined || !document || !order) return;
    setSavingCategory(true);
    setError(null);
    try {
      const res = await fetch("/api/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, order, category: pendingCategory }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update category");
      }
      onCategoryChange(pendingCategory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category");
    } finally {
      setSavingCategory(false);
      setPendingCategory(undefined);
    }
  };

  // Group categories by group for the dropdown
  const groupedCategories = categoryOptions.reduce<
    Record<string, { groupSr: string; items: CategoryOption[] }>
  >((acc, opt) => {
    if (!acc[opt.groupId]) {
      acc[opt.groupId] = { groupSr: opt.groupSr, items: [] };
    }
    acc[opt.groupId].items.push(opt);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="shrink-0 border-b border-white/10 bg-card px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category display — left side */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              disabled={savingCategory}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              {savingCategory ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Tag className="h-3.5 w-3.5" />
              )}
              {categorySr ? (
                <span>
                  <span className="text-foreground">{categorySr}</span>
                  {categoryGroupSr && (
                    <span className="ml-1 text-muted-foreground/60">({categoryGroupSr})</span>
                  )}
                </span>
              ) : (
                <span className="italic text-muted-foreground/60">Bez kategorije</span>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>

            {/* Category dropdown */}
            {showCategoryDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCategoryDropdown(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-72 overflow-y-auto rounded-md border border-white/10 bg-card shadow-lg">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                      category === null ? "bg-accent text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span className="italic">Bez kategorije</span>
                  </button>
                  {Object.entries(groupedCategories).map(([groupId, group]) => (
                    <div key={groupId}>
                      <div className="sticky top-0 bg-card/95 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 border-t border-white/5">
                        {group.groupSr}
                      </div>
                      {group.items.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleCategorySelect(opt.id)}
                          className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                            category === opt.id
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {opt.sr}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Confirmation dialog */}
          {pendingCategory !== undefined && (
            <>
              <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setPendingCategory(undefined)} />
              <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-card p-4 shadow-lg w-80">
                <p className="text-sm text-foreground mb-1">Change category?</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {categorySr || "Bez kategorije"}
                  {" → "}
                  {categoryOptions.find((c) => c.id === pendingCategory)?.sr || "Bez kategorije"}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setPendingCategory(undefined)}
                    className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCategory}
                    disabled={savingCategory}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {savingCategory && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Confirm
                  </button>
                </div>
              </div>
            </>
          )}

          {error && (
            <span className="inline-flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </span>
          )}

          {/* Report buttons — right side */}
          <div className="ml-auto flex items-center gap-2">
            {!report && (
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Flag className="h-3.5 w-3.5" />
                Report Problem
              </button>
            )}

            {report && (
              <>
                <button
                  onClick={() => {
                    setShowDescription(!showDescription);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {showDescription ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  View Report
                </button>
                <button
                  onClick={handleMarkFixed}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Mark as Fixed
                </button>
              </>
            )}
          </div>
        </div>

        {/* Report form */}
        {showForm && !report && (
          <div className="mt-2 space-y-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem with this solution..."
              className="w-full resize-none rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmitReport}
                disabled={submitting || !description.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setDescription("");
                  setError(null);
                }}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Report description */}
        {showDescription && report && (
          <div className="mt-2 rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground">
            {report.description}
          </div>
        )}
      </div>

      {/* Solution iframe */}
      <iframe
        key={solutionUrl}
        src={solutionUrl}
        className="min-h-0 flex-1 border-0"
        title="Rešenje zadatka"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
