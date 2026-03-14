export interface RawDocument {
  filename: string;
  university: string;
  faculty: string;
  year: number | null;
  extra: string | null;
}

export interface RawProblem {
  id: string;
  document: string;
  order: number;
  solution_path: string;
  category: string | null;
  difficulty: number | null;
}

export interface RawCategory {
  id: string;
  en: string;
  sr: string;
}

export interface RawCategoryGroup {
  id: string;
  en: string;
  sr: string;
  categories: string[];
}

export interface CategoryOption {
  id: string;
  sr: string;
  groupId: string;
  groupSr: string;
}

export interface ProblemEntry {
  id: string;
  order: number;
  document: string;
  category: string | null;
  categorySr: string | null;
  categoryGroupId: string | null;
  categoryGroupSr: string | null;
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
