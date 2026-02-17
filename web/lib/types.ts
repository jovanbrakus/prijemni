export interface RawDocument {
  filename: string;
  university: string;
  faculty: string;
  year: number | null;
  extra: string | null;
}

export interface RawProblem {
  document: string;
  order: number;
  solution_path: string;
  category: string | null;
}

export interface RawCategory {
  id: string;
  en: string;
  sr: string;
}

export interface ProblemEntry {
  order: number;
  document: string;
  category: string | null;
  categorySr: string | null;
  solutionUrl: string;
}

export interface Report {
  document: string;
  order: number;
  description: string;
}

export interface YearEntry {
  year: number;
  problems: ProblemEntry[];
}

export interface FacultyEntry {
  slug: string;
  displayName: string;
  years: YearEntry[];
}
