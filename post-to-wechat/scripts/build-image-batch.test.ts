import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

async function makeFixture(): Promise<{
  root: string;
  outlinePath: string;
  promptsDir: string;
  stylesDir: string;
  outputPath: string;
  imagesDir: string;
}> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "build-image-batch-"));
  const promptsDir = path.join(root, "imgs", "prompts");
  const stylesDir = path.join(root, "styles");
  const imagesDir = path.join(root, "imgs");
  const outlinePath = path.join(imagesDir, "outline.md");
  const outputPath = path.join(imagesDir, "batch.json");

  await fs.mkdir(promptsDir, { recursive: true });
  await fs.mkdir(stylesDir, { recursive: true });
  await fs.writeFile(outlinePath, [
    "## Illustration 1",
    "",
    "**Filename**: cover.png",
    "",
  ].join("\n"));
  await fs.writeFile(path.join(promptsDir, "01-cover.md"), [
    "---",
    "illustration_id: 01",
    "type: infographic",
    "style: vector-illustration",
    "---",
    "",
    "Cover prompt",
    "",
  ].join("\n"));

  return { root, outlinePath, promptsDir, stylesDir, outputPath, imagesDir };
}

test("build-image-batch includes the prompt's style file in promptFiles", async () => {
  const fixture = await makeFixture();
  const stylePath = path.join(fixture.stylesDir, "vector-illustration.md");
  await fs.writeFile(stylePath, "# vector-illustration\n");

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "build-image-batch.ts"),
    "--outline", fixture.outlinePath,
    "--prompts", fixture.promptsDir,
    "--styles-dir", fixture.stylesDir,
    "--output", fixture.outputPath,
    "--images-dir", fixture.imagesDir,
  ], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  const batch = JSON.parse(await fs.readFile(fixture.outputPath, "utf8"));
  assert.deepEqual(batch.tasks[0].promptFiles, [
    path.join(fixture.promptsDir, "01-cover.md"),
    stylePath,
  ]);
});

test("build-image-batch fails when a prompt style file is missing", async () => {
  const fixture = await makeFixture();

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "build-image-batch.ts"),
    "--outline", fixture.outlinePath,
    "--prompts", fixture.promptsDir,
    "--styles-dir", fixture.stylesDir,
    "--output", fixture.outputPath,
    "--images-dir", fixture.imagesDir,
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Style file not found: .*vector-illustration\.md/);
});

test("build-image-batch fails when generated task count is below the requested minimum", async () => {
  const fixture = await makeFixture();
  await fs.writeFile(path.join(fixture.stylesDir, "vector-illustration.md"), "# vector-illustration\n");

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "build-image-batch.ts"),
    "--outline", fixture.outlinePath,
    "--prompts", fixture.promptsDir,
    "--styles-dir", fixture.stylesDir,
    "--output", fixture.outputPath,
    "--images-dir", fixture.imagesDir,
    "--min-images", "7",
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Expected at least 7 image tasks, got 1/);
});

test("build-image-batch rejects style names that escape the styles directory", async () => {
  const fixture = await makeFixture();
  await fs.writeFile(path.join(fixture.promptsDir, "01-cover.md"), [
    "---",
    "illustration_id: 01",
    "type: infographic",
    "style: ../outside",
    "---",
    "",
    "Cover prompt",
    "",
  ].join("\n"));

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "build-image-batch.ts"),
    "--outline", fixture.outlinePath,
    "--prompts", fixture.promptsDir,
    "--styles-dir", fixture.stylesDir,
    "--output", fixture.outputPath,
    "--images-dir", fixture.imagesDir,
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid prompt style/);
});

test("build-image-batch ignores backup prompt files", async () => {
  const fixture = await makeFixture();
  await fs.unlink(path.join(fixture.promptsDir, "01-cover.md"));
  await fs.writeFile(path.join(fixture.promptsDir, "01-cover-backup-20260503.md"), [
    "---",
    "illustration_id: 01",
    "type: infographic",
    "style: vector-illustration",
    "---",
    "",
    "Backup prompt",
    "",
  ].join("\n"));
  await fs.writeFile(path.join(fixture.stylesDir, "vector-illustration.md"), "# vector-illustration\n");

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "build-image-batch.ts"),
    "--outline", fixture.outlinePath,
    "--prompts", fixture.promptsDir,
    "--styles-dir", fixture.stylesDir,
    "--output", fixture.outputPath,
    "--images-dir", fixture.imagesDir,
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /No prompt file found for illustration 1/);
});

test("build-image-batch fails for invalid --min-images values", async () => {
  const fixture = await makeFixture();
  await fs.writeFile(path.join(fixture.stylesDir, "vector-illustration.md"), "# vector-illustration\n");

  const result = spawnSync("bun", [
    path.join(import.meta.dirname, "build-image-batch.ts"),
    "--outline", fixture.outlinePath,
    "--prompts", fixture.promptsDir,
    "--styles-dir", fixture.stylesDir,
    "--output", fixture.outputPath,
    "--images-dir", fixture.imagesDir,
    "--min-images", "many",
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--min-images must be a positive integer/);
});
