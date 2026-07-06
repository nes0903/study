import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptRoot, "..");
const studyRoot = path.resolve(appRoot, "..");
const args = new Set(process.argv.slice(2));

const write = args.has("--write");
const maxLinks = Number(readArg("--max-links") || 12);
const maxTermsPerDoc = Number(readArg("--max-terms-per-doc") || 20);

const generatedStart = "<!-- study-links:start -->";
const generatedEnd = "<!-- study-links:end -->";
const excludedDirs = new Set([
  ".git",
  ".obsidian",
  ".agents",
  ".doc",
  ".study-wiki",
  "node_modules",
]);
const excludedFiles = new Set(["AGENTS.md"]);
const stopTerms = new Set([
  "agent",
  "alter",
  "api",
  "app",
  "array",
  "between",
  "browser",
  "callback",
  "case",
  "code",
  "config",
  "constructor",
  "cookie",
  "create",
  "data",
  "dependency",
  "delete",
  "doc",
  "docs",
  "documents",
  "drop",
  "fan",
  "function",
  "get",
  "group",
  "http",
  "https",
  "injection",
  "insert",
  "integration",
  "index",
  "iso",
  "json",
  "like",
  "operator",
  "order",
  "origin",
  "parent",
  "patch",
  "pipeline",
  "policy",
  "post",
  "project",
  "protocol",
  "put",
  "query",
  "readme",
  "scope",
  "security",
  "select",
  "server",
  "service",
  "table",
  "test",
  "testing",
  "timing",
  "update",
  "where",
  "web",
  "개념",
  "구성",
  "기능",
  "기법",
  "대기",
  "단계",
  "문서",
  "방법",
  "비교",
  "설명",
  "예시",
  "요약",
  "정리",
  "정지",
  "종류",
  "특징",
]);

function readArg(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function normalize(value) {
  return value.normalize("NFKC").toLowerCase();
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) {
    return markdown;
  }

  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? markdown : markdown.slice(end + 4);
}

function stripGenerated(markdown) {
  const start = markdown.indexOf(generatedStart);
  const end = markdown.indexOf(generatedEnd);
  if (start === -1 || end === -1 || end < start) {
    return markdown;
  }

  return `${markdown.slice(0, start).trimEnd()}\n${markdown.slice(end + generatedEnd.length).trimStart()}`.trimEnd() + "\n";
}

function stripMarkdown(markdown) {
  return stripGenerated(stripFrontmatter(markdown))
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

function extractTitle(markdown, filePath) {
  const heading = stripFrontmatter(markdown).match(/^#\s+(.+)$/m);
  if (heading) {
    return heading[1].replace(/#+\s*$/, "").trim();
  }

  return path.basename(filePath, ".md");
}

function toVaultPath(filePath) {
  return path.relative(studyRoot, filePath).split(path.sep).join("/");
}

function linkTarget(doc) {
  const withoutExtension = doc.path.replace(/\.md$/, "");
  return `[[${withoutExtension}|${doc.title.replace(/\]/g, "")}]]`;
}

async function walkMarkdown(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name)) {
        files.push(...await walkMarkdown(path.join(dir, entry.name)));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md") && !excludedFiles.has(entry.name)) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

function termCandidates(value) {
  const normalizedValue = value.normalize("NFKC");
  const cleaned = normalizedValue
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]/g, " ")
    .replace(/[~`"'.,:;!?]/g, " ")
    .trim();

  const phrase = cleaned
    .replace(/[-_/\\|,_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const hasHangul = /\p{Script=Hangul}/u.test(cleaned);
  const parts = hasHangul
    ? cleaned.split(/[-_/\\|,_]+|\s+-\s+/gu)
    .map((part) => part.trim())
    .filter(Boolean)
    : [];
  const acronyms = cleaned.match(/\b[A-Z][A-Z0-9+#.]{1,}\b/g) || [];

  return [phrase, ...parts, ...acronyms]
    .flatMap((term) => {
      const words = term.split(/\s+/).filter(Boolean);
      if (words.length > 5) {
        return [words.slice(-3).join(" "), words.slice(-2).join(" ")];
      }
      return [term];
    })
    .map((term) => term.replace(/^\d+\s*/, "").trim())
    .filter(isUsefulTerm);
}

function isUsefulTerm(term) {
  const normalized = normalize(term);
  if (!normalized || stopTerms.has(normalized)) {
    return false;
  }
  if (/^\d+$/.test(normalized)) {
    return false;
  }
  if (/^[a-z0-9_.-]+$/.test(normalized)) {
    return normalized.length >= 3;
  }
  return normalized.length >= 2;
}

function containsTerm(text, term) {
  if (/^[a-z0-9_.+#-]+$/.test(term)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9_.+#-])${escaped}([^a-z0-9_.+#-]|$)`, "i").test(text);
  }

  return text.includes(term);
}

function extractAliases(markdown) {
  const frontmatter = markdown.startsWith("---")
    ? markdown.slice(3, markdown.indexOf("\n---", 3))
    : "";
  const aliases = [];
  const inline = frontmatter.match(/^aliases:\s*\[(.+)]/m);
  if (inline) {
    aliases.push(...inline[1].split(",").map((item) => item.trim().replace(/^["']|["']$/g, "")));
  }

  const block = frontmatter.match(/^aliases:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (block) {
    aliases.push(...block[1].split(/\r?\n/).map((line) => line.replace(/^\s+-\s+/, "").trim()));
  }

  return aliases.filter(Boolean);
}

function buildGeneratedSection(matches) {
  if (matches.length === 0) {
    return "";
  }

  const lines = [
    generatedStart,
    "## 관련 문서",
    "",
    ...matches.map((match) => `- \`${match.term}\`: ${linkTarget(match.doc)}`),
    generatedEnd,
  ];

  return `\n\n${lines.join("\n")}\n`;
}

function applyGeneratedSection(markdown, matches) {
  const withoutGenerated = stripGenerated(markdown).trimEnd();
  const section = buildGeneratedSection(matches);
  return section ? `${withoutGenerated}${section}` : `${withoutGenerated}\n`;
}

async function main() {
  const files = await walkMarkdown(studyRoot);
  const docs = [];

  for (const file of files) {
    const markdown = await readFile(file, "utf8");
    const title = extractTitle(markdown, file);
    const pathName = toVaultPath(file);
    const stem = path.basename(file, ".md");
    const parent = path.basename(path.dirname(file));
    const aliases = extractAliases(markdown);
    const rawTerms = [title, stem, parent, ...aliases].flatMap(termCandidates);
    const terms = [...new Set(rawTerms.map((term) => normalize(term)))]
      .sort((a, b) => b.length - a.length)
      .slice(0, maxTermsPerDoc);

    docs.push({
      file,
      path: pathName,
      title,
      markdown,
      text: normalize(stripMarkdown(markdown)),
      terms,
    });
  }

  const termMap = new Map();
  for (const doc of docs) {
    for (const term of doc.terms) {
      const targets = termMap.get(term) || [];
      targets.push(doc);
      termMap.set(term, targets);
    }
  }

  const preciseTerms = [...termMap.entries()]
    .filter(([, targets]) => targets.length <= 4)
    .filter(([term, targets]) => {
      const occurrenceCount = docs.reduce((count, doc) => {
        if (targets.some((target) => target.path === doc.path)) {
          return count;
        }
        return count + (containsTerm(doc.text, term) ? 1 : 0);
      }, 0);

      return occurrenceCount > 0 && occurrenceCount <= Math.max(12, Math.ceil(docs.length * 0.08));
    })
    .sort(([a], [b]) => b.length - a.length);

  const changes = [];

  for (const sourceDoc of docs) {
    const matches = [];
    const seenTargets = new Set();

    for (const [term, targets] of preciseTerms) {
      if (!containsTerm(sourceDoc.text, term)) {
        continue;
      }

      for (const target of targets) {
        if (target.path === sourceDoc.path || seenTargets.has(target.path)) {
          continue;
        }

        matches.push({ term, doc: target });
        seenTargets.add(target.path);
        break;
      }

      if (matches.length >= maxLinks) {
        break;
      }
    }

    const nextMarkdown = applyGeneratedSection(sourceDoc.markdown, matches);
    if (nextMarkdown !== sourceDoc.markdown) {
      changes.push({
        doc: sourceDoc,
        matches,
        nextMarkdown,
      });
    }
  }

  if (write) {
    for (const change of changes) {
      await writeFile(change.doc.file, change.nextMarkdown, "utf8");
    }
  }

  console.log(`${write ? "Updated" : "Would update"} ${changes.length} of ${docs.length} markdown files.`);
  for (const change of changes.slice(0, 30)) {
    const preview = change.matches
      .slice(0, 4)
      .map((match) => `${match.term} -> ${match.doc.path}`)
      .join("; ");
    console.log(`- ${change.doc.path}: ${change.matches.length} links${preview ? ` (${preview})` : ""}`);
  }

  if (changes.length > 30) {
    console.log(`...and ${changes.length - 30} more files.`);
  }

  if (!write) {
    console.log("Dry run only. Re-run with --write to modify markdown files.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
