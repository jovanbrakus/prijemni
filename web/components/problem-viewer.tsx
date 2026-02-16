"use client";

import { EmptyState } from "./empty-state";

interface ProblemViewerProps {
  solutionUrl: string | null;
}

export function ProblemViewer({ solutionUrl }: ProblemViewerProps) {
  if (!solutionUrl) {
    return <EmptyState />;
  }

  return (
    <iframe
      key={solutionUrl}
      src={solutionUrl}
      className="h-full w-full border-0"
      title="Rešenje zadatka"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
