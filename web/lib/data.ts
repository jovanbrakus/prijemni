import fs from "fs";
import path from "path";
import type {
  RawDocument,
  RawProblem,
  RawCategory,
  RawCategoryGroup,
  FacultyEntry,
  YearEntry,
  ProblemEntry,
  CategoryOption,
} from "./types";
import { FACULTY_NAMES } from "./faculty-names";

const databaseDir = path.resolve(process.cwd(), "..", "database");

function readJSON<T>(filename: string): T {
  const content = fs.readFileSync(path.join(databaseDir, filename), "utf-8");
  return JSON.parse(content) as T;
}

export function loadCategoryOptions(): CategoryOption[] {
  const categories = readJSON<RawCategory[]>("categories.json");
  const groups = readJSON<RawCategoryGroup[]>("category_groups.json");

  const options: CategoryOption[] = [];
  for (const group of groups) {
    for (const catId of group.categories) {
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        options.push({
          id: cat.id,
          sr: cat.sr,
          groupId: group.id,
          groupSr: group.sr,
        });
      }
    }
  }
  return options;
}

export function loadData(): { faculties: FacultyEntry[]; categoryOptions: CategoryOption[] } {
  const documents = readJSON<RawDocument[]>("documents.json");
  const problems = readJSON<RawProblem[]>("problems.json");
  const categories = readJSON<RawCategory[]>("categories.json");
  const groups = readJSON<RawCategoryGroup[]>("category_groups.json");

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const docMap = new Map(documents.map((d) => [d.filename, d]));

  // Build category → group mapping
  const categoryGroupMap = new Map<string, RawCategoryGroup>();
  for (const group of groups) {
    for (const catId of group.categories) {
      categoryGroupMap.set(catId, group);
    }
  }

  // Group problems by document
  const problemsByDoc = new Map<string, RawProblem[]>();
  for (const p of problems) {
    const list = problemsByDoc.get(p.document) || [];
    list.push(p);
    problemsByDoc.set(p.document, list);
  }

  // Build faculty -> year -> problems hierarchy
  const facultyMap = new Map<string, Map<number, ProblemEntry[]>>();

  for (const [docFilename, docProblems] of problemsByDoc) {
    const doc = docMap.get(docFilename);
    if (!doc || doc.year === null) continue;

    const yearMap =
      facultyMap.get(doc.faculty) || new Map<number, ProblemEntry[]>();
    facultyMap.set(doc.faculty, yearMap);

    const entries: ProblemEntry[] = docProblems
      .sort((a, b) => a.order - b.order)
      .map((p) => {
        const cat = p.category ? categoryMap.get(p.category) : null;
        const group = p.category ? categoryGroupMap.get(p.category) : null;
        return {
          order: p.order,
          document: docFilename,
          category: p.category,
          categorySr: cat?.sr ?? null,
          categoryGroupId: group?.id ?? null,
          categoryGroupSr: group?.sr ?? null,
          solutionUrl: `/api/solution/${p.solution_path.replace(/^problems\//, "")}`,
        };
      });

    yearMap.set(doc.year, entries);
  }

  // Convert to sorted arrays
  const faculties: FacultyEntry[] = [];
  for (const [slug, yearMap] of facultyMap) {
    const years: YearEntry[] = [];
    for (const [year, problems] of yearMap) {
      years.push({ year, problems });
    }
    years.sort((a, b) => b.year - a.year);

    faculties.push({
      slug,
      displayName: FACULTY_NAMES[slug] || slug,
      years,
    });
  }

  faculties.sort((a, b) => a.displayName.localeCompare(b.displayName));

  const categoryOptions = loadCategoryOptions();
  return { faculties, categoryOptions };
}
