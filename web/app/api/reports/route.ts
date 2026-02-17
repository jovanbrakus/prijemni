import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Report } from "@/lib/types";

const reportsPath = path.resolve(process.cwd(), "..", "database", "reports.json");

function readReports(): Report[] {
  if (!fs.existsSync(reportsPath)) return [];
  const content = fs.readFileSync(reportsPath, "utf-8");
  return JSON.parse(content) as Report[];
}

function writeReports(reports: Report[]): void {
  fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2) + "\n", "utf-8");
}

export async function GET() {
  try {
    const reports = readReports();
    return NextResponse.json(reports);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to read reports";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, order, description } = body as {
      document: string;
      order: number;
      description: string;
    };

    if (!document || !order || !description?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reports = readReports();
    const existing = reports.find(
      (r) => r.document === document && r.order === order
    );
    if (existing) {
      return NextResponse.json(
        { error: "Report already exists for this problem" },
        { status: 409 }
      );
    }

    reports.push({ document, order, description: description.trim() });
    writeReports(reports);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, order } = body as { document: string; order: number };

    if (!document || !order) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reports = readReports();
    const index = reports.findIndex(
      (r) => r.document === document && r.order === order
    );
    if (index === -1) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    reports.splice(index, 1);
    writeReports(reports);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
