"use client";

import { useState } from "react";
import { Flag, Eye, EyeOff, Check, Loader2, AlertCircle } from "lucide-react";
import { EmptyState } from "./empty-state";
import type { Report } from "@/lib/types";

interface ProblemViewerProps {
  solutionUrl: string | null;
  document: string | null;
  order: number | null;
  report: Report | null;
  onReportChange: () => void;
}

export function ProblemViewer({
  solutionUrl,
  document,
  order,
  report,
  onReportChange,
}: ProblemViewerProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="shrink-0 border-b border-white/10 bg-card px-4 py-2">
        <div className="flex items-center gap-2">
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

          {error && (
            <span className="inline-flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </span>
          )}
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
