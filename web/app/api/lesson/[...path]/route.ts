import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.join(process.cwd(), "..", "knowledge", ...segments);

  const resolved = path.resolve(filePath);
  const knowledgeDir = path.resolve(process.cwd(), "..", "knowledge");
  if (!resolved.startsWith(knowledgeDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(resolved)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";
  const isText = contentType.includes("charset=utf-8");
  const body = isText
    ? fs.readFileSync(resolved, "utf-8")
    : fs.readFileSync(resolved);

  return new NextResponse(body, {
    headers: { "Content-Type": contentType },
  });
}
