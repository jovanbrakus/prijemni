import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Read solution-v2.css once at startup
const cssPath = path.resolve(process.cwd(), "..", "problems_v2", "solution-v2.css");
const SOLUTION_CSS = fs.existsSync(cssPath)
  ? fs.readFileSync(cssPath, "utf-8")
  : "";

function wrapFragment(fragment: string, theme: string): string {
  const themeClass = theme === "light" ? "light" : "dark";
  return `<!DOCTYPE html>
<html lang="sr" class="${themeClass}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>
MathJax = {
  tex: {
    inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
    displayMath: [['\\\\[', '\\\\]']]
  },
  svg: { fontCache: 'global' }
};
</script>
<script id="MathJax-script" async
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js">
</script>
<style>${SOLUTION_CSS}</style>
</head>
<body>
<div class="solution-container">
${fragment}
</div>
<script>
// Theme change listener from parent
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'matoteka-theme') {
    document.documentElement.className = e.data.theme;
  }
});
</script>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const theme = request.nextUrl.searchParams.get("theme") || "dark";
  const filePath = path.join(process.cwd(), "..", "problems_v2", ...segments);

  // Prevent directory traversal
  const resolved = path.resolve(filePath);
  const problemsDir = path.resolve(process.cwd(), "..", "problems_v2");
  if (!resolved.startsWith(problemsDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(resolved)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fragment = fs.readFileSync(resolved, "utf-8");
  const html = wrapFragment(fragment, theme);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
