import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const studyRoot = path.resolve(appRoot, "..");
const publicRoot = path.join(appRoot, "public");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4317);

const excludedDirs = new Set([
  ".git",
  ".obsidian",
  ".agents",
  ".doc",
  ".study-wiki",
  "node_modules",
]);
const excludedFiles = new Set(["AGENTS.md"]);
const indexTtlMs = 15_000;

let indexCache = null;
let indexPromise = null;

const stopWords = new Set([
  "and",
  "are",
  "for",
  "from",
  "into",
  "not",
  "the",
  "this",
  "that",
  "with",
  "http",
  "https",
  "true",
  "false",
  "mermaid",
  "flowchart",
  "graph",
  "sequenceDiagram",
  "section",
  "class",
  "style",
  "작성일",
  "범위",
  "주의",
  "요약",
  "중요",
  "예시",
  "참고",
  "링크",
  "개념",
  "정의",
  "설명",
]);

function normalize(value) {
  return value.normalize("NFKC").toLowerCase();
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) {
    return markdown;
  }

  const end = markdown.indexOf("\n---", 3);
  if (end === -1) {
    return markdown;
  }

  return markdown.slice(end + 4);
}

function stripMarkdown(markdown) {
  return stripFrontmatter(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/\[\[([^|\]]+)\|([^\]]+)]]/g, "$2 $1")
    .replace(/\[\[([^\]]+)]]/g, "$1")
    .replace(/[`*_>#|~=-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const tokens = [];
  for (const match of normalize(text).matchAll(/[\p{Letter}\p{Number}][\p{Letter}\p{Number}_+.#-]*/gu)) {
    const token = match[0].replace(/^[-_.]+|[-_.]+$/g, "");
    if (token.length < 2 || stopWords.has(token)) {
      continue;
    }
    tokens.push(token);
  }
  return tokens;
}

function extractTitle(markdown, filePath) {
  const body = stripFrontmatter(markdown);
  const heading = body.match(/^#\s+(.+)$/m);
  if (heading) {
    return heading[1].replace(/#+\s*$/, "").trim();
  }

  return path.basename(filePath, ".md");
}

function toVaultPath(filePath) {
  return path.relative(studyRoot, filePath).split(path.sep).join("/");
}

async function walkMarkdown(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) {
        continue;
      }
      files.push(...await walkMarkdown(path.join(dir, entry.name)));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".md") || excludedFiles.has(entry.name)) {
      continue;
    }

    files.push(path.join(dir, entry.name));
  }

  return files;
}

function countTokens(tokens) {
  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return counts;
}

async function buildIndex() {
  const files = await walkMarkdown(studyRoot);
  const docs = [];
  const df = new Map();

  for (const file of files) {
    const markdown = await readFile(file, "utf8");
    const cleanText = stripMarkdown(markdown);
    const tokens = tokenize(`${extractTitle(markdown, file)} ${cleanText}`);
    const counts = countTokens(tokens);
    const unique = new Set(tokens);

    for (const token of unique) {
      df.set(token, (df.get(token) || 0) + 1);
    }

    docs.push({
      path: toVaultPath(file),
      absolutePath: file,
      title: extractTitle(markdown, file),
      markdown,
      cleanText,
      tokens,
      counts,
      length: Math.max(tokens.length, 1),
    });
  }

  indexCache = {
    builtAt: Date.now(),
    docs,
    df,
    totalDocs: docs.length,
  };

  return indexCache;
}

async function getIndex() {
  if (indexCache && Date.now() - indexCache.builtAt < indexTtlMs) {
    return indexCache;
  }

  if (!indexPromise) {
    indexPromise = buildIndex().finally(() => {
      indexPromise = null;
    });
  }

  return indexPromise;
}

function idf(index, token) {
  const seen = index.df.get(token) || 0;
  return Math.log((index.totalDocs + 1) / (seen + 0.5)) + 1;
}

function makeSnippet(markdown, queryTokens) {
  const lines = stripFrontmatter(markdown).split(/\r?\n/);
  let bestLine = 0;
  let bestScore = 0;

  lines.forEach((line, lineIndex) => {
    const normalizedLine = normalize(line);
    const score = queryTokens.reduce((sum, token) => sum + (normalizedLine.includes(token) ? 1 : 0), 0);
    if (score > bestScore) {
      bestLine = lineIndex;
      bestScore = score;
    }
  });

  const start = Math.max(0, bestLine - 1);
  const snippet = lines
    .slice(start, start + 3)
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();

  return snippet.slice(0, 520);
}

function searchLocal(index, query, limit = 8) {
  const queryTokens = [...new Set(tokenize(query))];
  const normalizedQuery = normalize(query).trim();

  if (queryTokens.length === 0 && normalizedQuery.length === 0) {
    return [];
  }

  return index.docs
    .map((doc) => {
      let score = 0;
      for (const token of queryTokens) {
        const tf = doc.counts.get(token) || 0;
        if (tf > 0) {
          score += (1 + Math.log(tf)) * idf(index, token);
        }

        if (normalize(doc.title).includes(token)) {
          score += 4;
        }
      }

      if (normalizedQuery && normalize(doc.cleanText).includes(normalizedQuery)) {
        score += 12;
      }

      score = score / Math.sqrt(doc.length);

      return {
        path: doc.path,
        title: doc.title,
        score,
        snippet: makeSnippet(doc.markdown, queryTokens),
        source: "local",
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function oneLine(value) {
  return String(value).replace(/\s+/g, " ").replace(/"/g, "'").trim().slice(0, 500);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || studyRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Command timed out: ${command} ${args.join(" ")}`));
    }, options.timeoutMs || 15_000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(stderr || stdout || `Command exited with ${code}`));
    });
  });
}

async function findQmdEntrypoint() {
  if (process.env.QMD_BIN) {
    return process.env.QMD_BIN;
  }

  const localBin = path.join(appRoot, "node_modules", ".bin", "qmd");
  try {
    if ((await stat(localBin)).isFile()) {
      return localBin;
    }
  } catch {
    // Fall through to the npx cache lookup.
  }

  const npxRoot = path.join(os.homedir(), ".npm", "_npx");
  try {
    const entries = await readdir(npxRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const candidate = path.join(
        npxRoot,
        entry.name,
        "node_modules",
        "@tobilu",
        "qmd",
        "dist",
        "cli",
        "qmd.js",
      );
      try {
        if ((await stat(candidate)).isFile()) {
          return candidate;
        }
      } catch {
        // Keep looking through other npx cache directories.
      }
    }
  } catch {
    // Fall through to npx as a last resort.
  }

  return "npx";
}

async function runQmd(args, options = {}) {
  const entrypoint = await findQmdEntrypoint();
  if (entrypoint === "npx") {
    return runCommand("npx", ["--yes", "@tobilu/qmd", ...args], options);
  }
  if (entrypoint.endsWith(".js")) {
    return runCommand(process.execPath, [entrypoint, ...args], options);
  }
  return runCommand(entrypoint, args, options);
}

function parseJsonFromMixedOutput(stdout) {
  const arrayStart = stdout.indexOf("[");
  const objectStart = stdout.indexOf("{");
  const candidates = [arrayStart, objectStart].filter((index) => index >= 0);
  if (candidates.length === 0) {
    throw new Error("QMD did not return JSON output");
  }

  return JSON.parse(stdout.slice(Math.min(...candidates)));
}

function normalizeQmdRows(parsed) {
  const rows = Array.isArray(parsed) ? parsed : parsed.results || parsed.items || parsed.matches || [];

  return rows
    .map((row) => {
      const filePath = row.path || row.file || row.filename || row.document || row.uri || "";
      const absolutePath = filePath.startsWith("./")
        ? path.resolve(studyRoot, filePath)
        : filePath.startsWith("/")
          ? filePath
          : path.resolve(studyRoot, filePath);
      const relativePath = absolutePath.startsWith(studyRoot)
        ? toVaultPath(absolutePath)
        : String(filePath).replace(/^qmd:\/\//, "");

      return {
        path: relativePath,
        title: row.title || path.basename(relativePath, ".md"),
        score: Number(row.score || row.rrfScore || row.similarity || 0),
        snippet: row.snippet || row.text || row.content || "",
        source: "qmd",
      };
    })
    .filter((row) => row.path && row.path.endsWith(".md"));
}

async function searchQmd(query, limit) {
  const queryDoc = [
    "intent: Find study notes relevant to the user's question inside the local study vault.",
    `lex: ${oneLine(query)}`,
    `vec: ${oneLine(query)}`,
    `hyde: A study note explains ${oneLine(query)} with practical technical details.`,
  ].join("\n");

  const { stdout } = await runQmd([
    "query",
    queryDoc,
    "--format",
    "json",
    "--full-path",
    "--no-rerank",
    "-n",
    String(limit),
  ], { timeoutMs: 30_000 });

  return normalizeQmdRows(parseJsonFromMixedOutput(stdout));
}

function mergeResults(primary, secondary, limit) {
  const byPath = new Map();
  const merged = [];

  for (const result of primary) {
    if (!byPath.has(result.path)) {
      byPath.set(result.path, result);
      merged.push(result);
    }
  }

  for (const result of secondary) {
    if (!byPath.has(result.path)) {
      byPath.set(result.path, result);
      merged.push(result);
    }
  }

  return merged.slice(0, limit);
}

function makeAnswer(message, results, source, qmdError) {
  if (results.length === 0) {
    return [
      "관련 문서를 찾지 못했습니다.",
      "질문을 더 구체적인 키워드나 오류 메시지 중심으로 바꾸면 다시 찾을 수 있습니다.",
    ];
  }

  const lead = source === "qmd"
    ? "QMD 기반 검색 결과입니다."
    : "로컬 키워드 인덱스 기반 결과입니다.";
  const fallback = qmdError
    ? `QMD 검색은 실패해서 로컬 인덱스로 대체했습니다: ${qmdError}`
    : null;

  return [
    lead,
    fallback,
    `질문: ${message}`,
    ...results.slice(0, 5).map((result, index) => `${index + 1}. ${result.title} (${result.path})`),
  ].filter(Boolean);
}

async function getQmdStatus() {
  try {
    const { stdout } = await runQmd(["status"], {
      timeoutMs: 8_000,
    });
    return stdout;
  } catch (error) {
    return `QMD status unavailable: ${error.message}`;
  }
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(value, null, 2));
}

function sendText(response, statusCode, value) {
  response.writeHead(statusCode, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(value);
}

async function sendStatic(response, pathname) {
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(publicRoot, `.${requestPath}`);

  if (!filePath.startsWith(publicRoot)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    const contentType = filePath.endsWith(".html")
      ? "text/html; charset=utf-8"
      : filePath.endsWith(".css")
        ? "text/css; charset=utf-8"
        : filePath.endsWith(".js")
          ? "text/javascript; charset=utf-8"
          : "application/octet-stream";

    response.writeHead(200, { "content-type": contentType });
    createReadStream(filePath).pipe(response);
  } catch {
    sendText(response, 404, "Not found");
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

    if (request.method === "GET" && url.pathname === "/api/status") {
      const [index, qmd] = await Promise.all([getIndex(), getQmdStatus()]);
      sendJson(response, 200, {
        root: studyRoot,
        documents: index.totalDocs,
        indexBuiltAt: new Date(index.builtAt).toISOString(),
        qmd,
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/doc") {
      const requestedPath = url.searchParams.get("path") || "";
      const filePath = path.resolve(studyRoot, requestedPath);
      if (!filePath.startsWith(studyRoot) || !filePath.endsWith(".md")) {
        sendJson(response, 400, { error: "Invalid path" });
        return;
      }
      sendJson(response, 200, {
        path: toVaultPath(filePath),
        content: await readFile(filePath, "utf8"),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      const body = await readJsonBody(request);
      const message = String(body.message || "").trim();
      const mode = String(body.mode || "hybrid");
      const limit = Math.min(Math.max(Number(body.limit || 8), 1), 20);

      if (!message) {
        sendJson(response, 400, { error: "message is required" });
        return;
      }

      const index = await getIndex();
      const localResults = searchLocal(index, message, limit);
      let qmdResults = [];
      let qmdError = "";

      if (mode !== "local") {
        try {
          qmdResults = await searchQmd(message, limit);
        } catch (error) {
          qmdError = error.message.slice(0, 400);
        }
      }

      const source = qmdResults.length > 0 ? "qmd" : "local";
      const results = qmdResults.length > 0
        ? mergeResults(qmdResults, localResults, limit)
        : localResults;

      sendJson(response, 200, {
        message,
        source,
        qmdError: qmdError || null,
        answer: makeAnswer(message, results, source, qmdError),
        results,
      });
      return;
    }

    if (request.method === "GET") {
      await sendStatic(response, url.pathname);
      return;
    }

    sendText(response, 405, "Method not allowed");
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Study Wiki running at http://${host}:${port}`);
  console.log(`Vault root: ${studyRoot}`);
});
