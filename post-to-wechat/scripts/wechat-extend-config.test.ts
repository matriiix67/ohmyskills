import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import test, { type TestContext } from "node:test";

import { loadCredentials, loadWechatExtendConfig } from "./wechat-extend-config.ts";

function useCwd(t: TestContext, cwd: string): void {
  const previous = process.cwd();
  process.chdir(cwd);
  t.after(() => {
    process.chdir(previous);
  });
}

function useHome(t: TestContext, home: string): void {
  const previous = process.env.HOME;
  process.env.HOME = home;
  t.after(() => {
    if (previous === undefined) {
      delete process.env.HOME;
      return;
    }
    process.env.HOME = previous;
  });
}

function useWechatEnv(
  t: TestContext,
  values: Partial<Record<"WECHAT_APP_ID" | "WECHAT_APP_SECRET", string | undefined>>,
): void {
  const previous = {
    WECHAT_APP_ID: process.env.WECHAT_APP_ID,
    WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET,
  };

  if (values.WECHAT_APP_ID === undefined) {
    delete process.env.WECHAT_APP_ID;
  } else {
    process.env.WECHAT_APP_ID = values.WECHAT_APP_ID;
  }

  if (values.WECHAT_APP_SECRET === undefined) {
    delete process.env.WECHAT_APP_SECRET;
  } else {
    process.env.WECHAT_APP_SECRET = values.WECHAT_APP_SECRET;
  }

  t.after(() => {
    if (previous.WECHAT_APP_ID === undefined) {
      delete process.env.WECHAT_APP_ID;
    } else {
      process.env.WECHAT_APP_ID = previous.WECHAT_APP_ID;
    }

    if (previous.WECHAT_APP_SECRET === undefined) {
      delete process.env.WECHAT_APP_SECRET;
    } else {
      process.env.WECHAT_APP_SECRET = previous.WECHAT_APP_SECRET;
    }
  });
}

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeEnvFile(root: string, content: string): Promise<void> {
  const envPath = path.join(root, ".post-to-wechat", ".env");
  await fs.mkdir(path.dirname(envPath), { recursive: true });
  await fs.writeFile(envPath, content);
}

async function writeExtendFile(root: string, content: string): Promise<void> {
  const extendPath = path.join(root, ".post-to-wechat", "EXTEND.md");
  await fs.mkdir(path.dirname(extendPath), { recursive: true });
  await fs.writeFile(extendPath, content);
}

test("loadWechatExtendConfig reads illustration preferences from EXTEND.md", async (t) => {
  const cwdRoot = await makeTempDir("wechat-extend-cwd-");

  useCwd(t, cwdRoot);
  await writeExtendFile(cwdRoot, [
    "default_theme: modern",
    "illustration_style: vector-illustration",
    "illustration_density: rich",
    "illustration_image_count: 7",
    "illustration_watermark: @ohmyskills",
    "illustration_watermark_position: bottom-right",
    "illustration_language: zh",
    "",
  ].join("\n"));

  const config = loadWechatExtendConfig();

  assert.equal(config.default_theme, "modern");
  assert.equal(config.illustration_style, "vector-illustration");
  assert.equal(config.illustration_density, "rich");
  assert.equal(config.illustration_image_count, 7);
  assert.equal(config.illustration_watermark, "@ohmyskills");
  assert.equal(config.illustration_watermark_position, "bottom-right");
  assert.equal(config.illustration_language, "zh");
});

test("loadWechatExtendConfig parses keys and booleans case-insensitively", async (t) => {
  const cwdRoot = await makeTempDir("wechat-extend-cwd-");

  useCwd(t, cwdRoot);
  await writeExtendFile(cwdRoot, [
    "DEFAULT_THEME: Modern",
    "Need_Open_Comment: TRUE",
    "Only_Fans_Can_Comment: False",
    "ILLUSTRATION_IMAGE_COUNT: 7",
    "",
  ].join("\n"));

  const config = loadWechatExtendConfig();

  assert.equal(config.default_theme, "Modern");
  assert.equal(config.need_open_comment, 1);
  assert.equal(config.only_fans_can_comment, 0);
  assert.equal(config.illustration_image_count, 7);
});

test("loadCredentials selects the first complete source without mixing values across sources", async (t) => {
  const cwdRoot = await makeTempDir("wechat-creds-cwd-");
  const homeRoot = await makeTempDir("wechat-creds-home-");

  useCwd(t, cwdRoot);
  useHome(t, homeRoot);
  useWechatEnv(t, {
    WECHAT_APP_ID: undefined,
    WECHAT_APP_SECRET: "stale-secret-from-process-env",
  });

  await writeEnvFile(cwdRoot, "WECHAT_APP_ID=cwd-app-id\nWECHAT_APP_SECRET=cwd-app-secret\n");
  await writeEnvFile(homeRoot, "WECHAT_APP_ID=home-app-id\nWECHAT_APP_SECRET=home-app-secret\n");

  const credentials = loadCredentials();

  assert.equal(credentials.appId, "cwd-app-id");
  assert.equal(credentials.appSecret, "cwd-app-secret");
  assert.equal(credentials.source, "<cwd>/.post-to-wechat/.env");
  assert.deepEqual(credentials.skippedSources, [
    "process.env missing WECHAT_APP_ID",
  ]);
});

test("loadCredentials prefers a complete process.env pair over lower-priority files", async (t) => {
  const cwdRoot = await makeTempDir("wechat-creds-cwd-");
  const homeRoot = await makeTempDir("wechat-creds-home-");

  useCwd(t, cwdRoot);
  useHome(t, homeRoot);
  useWechatEnv(t, {
    WECHAT_APP_ID: "env-app-id",
    WECHAT_APP_SECRET: "env-app-secret",
  });

  await writeEnvFile(cwdRoot, "WECHAT_APP_ID=cwd-app-id\nWECHAT_APP_SECRET=cwd-app-secret\n");
  await writeEnvFile(homeRoot, "WECHAT_APP_ID=home-app-id\nWECHAT_APP_SECRET=home-app-secret\n");

  const credentials = loadCredentials();

  assert.equal(credentials.appId, "env-app-id");
  assert.equal(credentials.appSecret, "env-app-secret");
  assert.equal(credentials.source, "process.env");
  assert.deepEqual(credentials.skippedSources, []);
});

test("loadCredentials reports skipped incomplete sources when no complete pair exists", async (t) => {
  const cwdRoot = await makeTempDir("wechat-creds-cwd-");
  const homeRoot = await makeTempDir("wechat-creds-home-");

  useCwd(t, cwdRoot);
  useHome(t, homeRoot);
  useWechatEnv(t, {
    WECHAT_APP_ID: "env-app-id",
    WECHAT_APP_SECRET: undefined,
  });

  await writeEnvFile(cwdRoot, "WECHAT_APP_SECRET=cwd-app-secret\n");

  assert.throws(
    () => loadCredentials(),
    /Incomplete credential sources skipped:\n- process\.env missing WECHAT_APP_SECRET\n- <cwd>\/\.post-to-wechat\/\.env missing WECHAT_APP_ID/,
  );
});
