import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { RawProblem, RawCategory } from "@/lib/types";

const problemsPath = path.resolve(process.cwd(), "..", "database", "problems.json");
const categoriesPath = path.resolve(process.cwd(), "..", "database", "categories.json");

function readProblems(): RawProblem[] {
  const content = fs.readFileSync(problemsPath, "utf-8");
  return JSON.parse(content) as RawProblem[];
}

function writeProblems(problems: RawProblem[]): void {
  fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2) + "\n", "utf-8");
}

function readCategories(): RawCategory[] {
  const content = fs.readFileSync(categoriesPath, "utf-8");
  return JSON.parse(content) as RawCategory[];
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, order, category } = body as {
      document: string;
      order: number;
      category: string | null;
    };

    if (!document || !order) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate category exists (if not null)
    if (category !== null) {
      const categories = readCategories();
      const valid = categories.some((c) => c.id === category);
      if (!valid) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
    }

    const problems = readProblems();
    const problem = problems.find(
      (p) => p.document === document && p.order === order
    );
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    problem.category = category;
    writeProblems(problems);

    return NextResponse.json({ ok: true, category });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
