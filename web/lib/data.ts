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
  LessonEntry,
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

function formatExtra(extra: string): string {
  return extra
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

  // Build faculty -> year+extra -> problems hierarchy
  type YearBucket = { year: number; extra: string | null; problems: ProblemEntry[] };
  const facultyMap = new Map<string, Map<string, YearBucket>>();

  for (const [docFilename, docProblems] of problemsByDoc) {
    const doc = docMap.get(docFilename);
    if (!doc || doc.year === null) continue;
    // Skip solution documents
    if (doc.extra === "resenja") continue;

    const yearMap =
      facultyMap.get(doc.faculty) || new Map<string, YearBucket>();
    facultyMap.set(doc.faculty, yearMap);

    const key = `${doc.year}:${doc.extra || ""}`;

    const entries: ProblemEntry[] = docProblems
      .sort((a, b) => a.order - b.order)
      .map((p) => {
        const cat = p.category ? categoryMap.get(p.category) : null;
        const group = p.category ? categoryGroupMap.get(p.category) : null;
        return {
          id: p.id,
          order: p.order,
          document: docFilename,
          category: p.category,
          categorySr: cat?.sr ?? null,
          categoryGroupId: group?.id ?? null,
          categoryGroupSr: group?.sr ?? null,
          solutionUrl: `/api/solution/${p.solution_path.replace(/^problems\//, "")}`,
        };
      });

    const existing = yearMap.get(key);
    if (existing) {
      existing.problems.push(...entries);
    } else {
      yearMap.set(key, { year: doc.year, extra: doc.extra, problems: entries });
    }
  }

  // Convert to sorted arrays
  const faculties: FacultyEntry[] = [];
  for (const [slug, yearMap] of facultyMap) {
    const years: YearEntry[] = [];
    for (const [, bucket] of yearMap) {
      years.push({
        year: bucket.year,
        extra: bucket.extra,
        label: bucket.extra
          ? `${bucket.year} (${formatExtra(bucket.extra)})`
          : `${bucket.year}`,
        problems: bucket.problems,
      });
    }
    years.sort((a, b) => b.year - a.year || (a.extra || "").localeCompare(b.extra || ""));

    faculties.push({
      slug,
      displayName: FACULTY_NAMES[slug] || slug,
      years,
    });
  }

  faculties.sort((a, b) => a.displayName.localeCompare(b.displayName));

  const categoryOptions = loadCategoryOptions();
  const lessons = loadLessons();
  return { faculties, categoryOptions, lessons };
}

export function loadLessons(): LessonEntry[] {
  const knowledgeDir = path.resolve(process.cwd(), "..", "knowledge");
  if (!fs.existsSync(knowledgeDir)) return [];

  const lessons: LessonEntry[] = [];
  const dirs = fs.readdirSync(knowledgeDir, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    // e.g. lesson1_codex, lesson1.5_codex
    const dirMatch = dir.name.match(/^lesson([\d.]+)_codex$/);
    if (!dirMatch) continue;

    const lessonNum = parseFloat(dirMatch[1]);
    const files = fs.readdirSync(path.join(knowledgeDir, dir.name));
    const htmlFile = files.find((f) => f.endsWith(".html"));
    if (!htmlFile) continue;

    // Extract title from filename: lesson1_iskazi_i_iskazne_formule.html
    // Remove lessonN_ prefix and .html suffix, then format
    const slug = htmlFile.replace(/\.html$/, "").replace(/^lesson[\d.]+_/, "");
    const title = slug
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    lessons.push({
      id: `lesson${dirMatch[1]}`,
      number: lessonNum,
      title: `${Math.floor(lessonNum)}. ${title}`,
      url: `/api/lesson/${dir.name}/${htmlFile}`,
    });
  }

  lessons.sort((a, b) => a.number - b.number);
  return lessons;
}
