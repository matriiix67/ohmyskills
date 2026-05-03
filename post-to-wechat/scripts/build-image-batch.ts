import path from "node:path";
import process from "node:process";
import { access, readdir, readFile, writeFile } from "node:fs/promises";

type CliArgs = {
  outlinePath: string | null;
  promptsDir: string | null;
  stylesDir: string | null;
  outputPath: string | null;
  imagesDir: string | null;
  minImages: number;
  provider: string;
  model: string;
  aspectRatio: string;
  quality: string;
  jobs: number | null;
  help: boolean;
};

type OutlineEntry = {
  index: number;
  filename: string;
};

function printUsage(): void {
  console.log(`Usage:
  npx -y tsx scripts/build-image-batch.ts --outline imgs/outline.md --prompts imgs/prompts --styles-dir references/illustration-styles --output imgs/batch.json --images-dir imgs

Options:
  --outline <path>     Path to outline.md
  --prompts <path>     Path to prompts directory
  --styles-dir <path>  Path to illustration style files
  --output <path>      Path to output batch.json
  --images-dir <path>  Directory for generated images
  --min-images <n>     Fail if fewer than n image tasks are generated (optional)
  --provider <name>    Provider for post-to-wechat image generation batch tasks (default: replicate)
  --model <id>         Model for post-to-wechat image generation batch tasks (default: google/nano-banana-pro)
  --ar <ratio>         Aspect ratio for all tasks (default: 16:9)
  --quality <level>    Quality for all tasks (default: 2k)
  --jobs <count>       Recommended worker count metadata (optional)
  -h, --help           Show help`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    outlinePath: null,
    promptsDir: null,
    stylesDir: null,
    outputPath: null,
    imagesDir: null,
    minImages: 0,
    provider: "replicate",
    model: "google/nano-banana-pro",
    aspectRatio: "16:9",
    quality: "2k",
    jobs: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i]!;
    if (current === "--outline") args.outlinePath = argv[++i] ?? null;
    else if (current === "--prompts") args.promptsDir = argv[++i] ?? null;
    else if (current === "--styles-dir") args.stylesDir = argv[++i] ?? null;
    else if (current === "--output") args.outputPath = argv[++i] ?? null;
    else if (current === "--images-dir") args.imagesDir = argv[++i] ?? null;
    else if (current === "--min-images") {
      const value = argv[++i];
      args.minImages = parsePositiveIntegerOption("--min-images", value);
    }
    else if (current === "--provider") args.provider = argv[++i] ?? args.provider;
    else if (current === "--model") args.model = argv[++i] ?? args.model;
    else if (current === "--ar") args.aspectRatio = argv[++i] ?? args.aspectRatio;
    else if (current === "--quality") args.quality = argv[++i] ?? args.quality;
    else if (current === "--jobs") {
      const value = argv[++i];
      args.jobs = value ? parseInt(value, 10) : null;
    } else if (current === "--help" || current === "-h") {
      args.help = true;
    }
  }
  return args;
}

function parsePositiveIntegerOption(name: string, value: string | undefined): number {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    throw new Error(`${name} must be a positive integer`);
  }
  return Number.parseInt(value, 10);
}

function parseOutline(content: string): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  const blocks = content.split(/^## Illustration\s+/m).slice(1);

  for (const block of blocks) {
    const indexMatch = block.match(/^(\d+)/);
    const filenameMatch = block.match(/\*\*Filename\*\*:\s*(.+)/);
    if (indexMatch && filenameMatch) {
      entries.push({
        index: parseInt(indexMatch[1]!, 10),
        filename: filenameMatch[1]!.trim(),
      });
    }
  }
  return entries;
}

async function findPromptFile(promptsDir: string, entry: OutlineEntry): Promise<string | null> {
  const files = await readdir(promptsDir);
  const prefix = String(entry.index).padStart(2, "0");
  const match = files
    .sort()
    .find((f) =>
      f.startsWith(`${prefix}-`) &&
      f.endsWith(".md") &&
      !/(^|-)backup(?:-|\.|$)/i.test(f)
    );
  return match ? path.join(promptsDir, match) : null;
}

function parsePromptStyle(content: string, promptFile: string): string {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Prompt frontmatter not found: ${promptFile}`);
  }
  const styleLine = match[1]!.split("\n").find((line) => line.trim().startsWith("style:"));
  const style = styleLine?.slice(styleLine.indexOf(":") + 1).trim().replace(/^['"]|['"]$/g, "");
  if (!style) {
    throw new Error(`Prompt style not found: ${promptFile}`);
  }
  if (!/^[a-z0-9-]+$/.test(style)) {
    throw new Error(`Invalid prompt style: ${style}`);
  }
  return style;
}

async function assertFileExists(filePath: string, message: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  if (!args.outlinePath) {
    console.error("Error: --outline is required");
    process.exit(1);
  }
  if (!args.promptsDir) {
    console.error("Error: --prompts is required");
    process.exit(1);
  }
  if (!args.stylesDir) {
    console.error("Error: --styles-dir is required");
    process.exit(1);
  }
  if (!args.outputPath) {
    console.error("Error: --output is required");
    process.exit(1);
  }

  const outlineContent = await readFile(args.outlinePath, "utf8");
  const entries = parseOutline(outlineContent);

  if (entries.length === 0) {
    console.error("No illustration entries found in outline.");
    process.exit(1);
  }

  const tasks = [];
  for (const entry of entries) {
    const promptFile = await findPromptFile(args.promptsDir, entry);
    if (!promptFile) {
      console.error(`Error: No prompt file found for illustration ${entry.index}`);
      process.exit(1);
    }
    const promptContent = await readFile(promptFile, "utf8");
    const style = parsePromptStyle(promptContent, promptFile);
    const stylesRoot = path.resolve(args.stylesDir);
    const styleFile = path.resolve(stylesRoot, `${style}.md`);
    if (!styleFile.startsWith(`${stylesRoot}${path.sep}`)) {
      console.error(`Error: Invalid prompt style: ${style}`);
      process.exit(1);
    }
    await assertFileExists(styleFile, `Style file not found: ${styleFile}`);

    const imageDir = args.imagesDir ?? path.dirname(args.outputPath);
    tasks.push({
      id: `illustration-${String(entry.index).padStart(2, "0")}`,
      promptFiles: [promptFile, styleFile],
      image: path.join(imageDir, entry.filename),
      provider: args.provider,
      model: args.model,
      ar: args.aspectRatio,
      quality: args.quality,
    });
  }

  if (args.minImages > 0 && tasks.length < args.minImages) {
    console.error(`Error: Expected at least ${args.minImages} image tasks, got ${tasks.length}`);
    process.exit(1);
  }

  const output: Record<string, unknown> = { tasks };
  if (args.jobs) output.jobs = args.jobs;

  await writeFile(args.outputPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`Batch file written: ${args.outputPath} (${tasks.length} tasks)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
