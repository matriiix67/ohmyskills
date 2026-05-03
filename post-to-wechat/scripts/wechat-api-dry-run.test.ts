import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

async function makeTempArticle(content: string): Promise<{ root: string; articlePath: string; coverPath: string }> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wechat-api-dry-run-"));
  const articlePath = path.join(root, "article.md");
  const coverPath = path.join(root, "cover.png");
  await fs.writeFile(articlePath, content);
  await fs.writeFile(coverPath, "placeholder image");
  return { root, articlePath, coverPath };
}

test("wechat-api dry-run fails for news articles without a cover or body image fallback", async () => {
  const fixture = await makeTempArticle([
    "---",
    "title: Missing cover",
    "summary: Missing cover summary",
    "---",
    "",
    "# Missing cover",
    "",
    "Body.",
    "",
  ].join("\n"));

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "wechat-api.ts"),
    fixture.articlePath,
    "--theme", "default",
    "--dry-run",
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /No cover image/);
});

test("wechat-api dry-run fails when body image count is below --min-images", async () => {
  const fixture = await makeTempArticle([
    "---",
    "title: Too few images",
    "summary: Too few images summary",
    "---",
    "",
    "# Too few images",
    "",
    "Body.",
    "",
  ].join("\n"));

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "wechat-api.ts"),
    fixture.articlePath,
    "--theme", "default",
    "--cover", fixture.coverPath,
    "--min-images", "6",
    "--dry-run",
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Expected at least 6 body images, got 0/);
});

test("wechat-api dry-run uses imgs/cover.png as the default news cover", async () => {
  const fixture = await makeTempArticle([
    "---",
    "title: Default cover",
    "summary: Default cover summary",
    "---",
    "",
    "# Default cover",
    "",
    "Body.",
    "",
  ].join("\n"));
  const imgsDir = path.join(fixture.root, "imgs");
  await fs.mkdir(imgsDir);
  await fs.writeFile(path.join(imgsDir, "cover.png"), "placeholder cover");

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "wechat-api.ts"),
    fixture.articlePath,
    "--theme", "default",
    "--dry-run",
  ], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
});

test("wechat-api dry-run fails when --require-cover has only body image fallback", async () => {
  const fixture = await makeTempArticle([
    "---",
    "title: Require cover",
    "summary: Require cover summary",
    "---",
    "",
    "# Require cover",
    "",
    "![One](body-1.png)",
    "![Two](body-2.png)",
    "![Three](body-3.png)",
    "![Four](body-4.png)",
    "![Five](body-5.png)",
    "![Six](body-6.png)",
    "",
  ].join("\n"));
  for (let i = 1; i <= 6; i++) {
    await fs.writeFile(path.join(fixture.root, `body-${i}.png`), "placeholder image");
  }

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "wechat-api.ts"),
    fixture.articlePath,
    "--theme", "default",
    "--min-images", "6",
    "--require-cover",
    "--dry-run",
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Cover image is required/);
});

test("wechat-api dry-run fails for invalid --min-images values", async () => {
  const fixture = await makeTempArticle([
    "---",
    "title: Invalid min images",
    "summary: Invalid min images summary",
    "---",
    "",
    "# Invalid min images",
    "",
  ].join("\n"));

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "wechat-api.ts"),
    fixture.articlePath,
    "--theme", "default",
    "--min-images", "six",
    "--dry-run",
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--min-images must be a positive integer/);
});

test("wechat-api dry-run renders markdown HTML inside the article workspace", async () => {
  const fixture = await makeTempArticle([
    "---",
    "title: Workspace render",
    "summary: Workspace render summary",
    "---",
    "",
    "# Workspace render",
    "",
    "Body.",
    "",
  ].join("\n"));

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "wechat-api.ts"),
    fixture.articlePath,
    "--theme", "default",
    "--cover", fixture.coverPath,
    "--dry-run",
  ], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(path.dirname(payload.htmlPath), path.join(fixture.root, ".wechat-render"));
});
