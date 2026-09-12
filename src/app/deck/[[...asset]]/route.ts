import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const DECK_ROOT = resolve(process.cwd(), "docs/ppt");

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset?: string[] }> }
) {
  const { asset } = await params;
  const requestedPath = asset?.length ? asset.join("/") : "index.html";
  const filePath = resolve(DECK_ROOT, requestedPath);

  if (filePath !== DECK_ROOT && !filePath.startsWith(`${DECK_ROOT}${sep}`)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    let content = await readFile(filePath, "utf8");
    const extension = extname(filePath).toLowerCase();

    if (extension === ".html") {
      content = content.replace(
        "<head>",
        '<head>\n    <base href="/deck/" />'
      );
    }

    return new Response(content, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
