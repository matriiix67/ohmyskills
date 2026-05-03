import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface WechatExtendConfig {
  default_theme?: string;
  default_color?: string;
  default_publish_method?: string;
  default_author?: string;
  need_open_comment?: number;
  only_fans_can_comment?: number;
  chrome_profile_path?: string;
  illustration_style?: string;
  illustration_density?: string;
  illustration_image_count?: number;
  illustration_watermark?: string;
  illustration_watermark_position?: string;
  illustration_language?: string;
}

function stripQuotes(s: string): string {
  return s.replace(/^['"]|['"]$/g, "");
}

function toBool01(v: string): number {
  const normalized = v.toLowerCase();
  return normalized === "1" || normalized === "true" ? 1 : 0;
}

function toPositiveInt(v: string): number | undefined {
  const parsed = parseInt(v, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseWechatExtend(content: string): WechatExtendConfig {
  const config: WechatExtendConfig = {};
  const lines = content.split("\n");

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const ci = trimmed.indexOf(":");
    if (ci < 0) continue;
    const key = trimmed.slice(0, ci).trim().toLowerCase();
    const val = stripQuotes(trimmed.slice(ci + 1).trim());
    if (val === "null" || val === "") continue;

    switch (key) {
      case "default_theme": config.default_theme = val; break;
      case "default_color": config.default_color = val; break;
      case "default_publish_method": config.default_publish_method = val; break;
      case "default_author": config.default_author = val; break;
      case "need_open_comment": config.need_open_comment = toBool01(val); break;
      case "only_fans_can_comment": config.only_fans_can_comment = toBool01(val); break;
      case "chrome_profile_path": config.chrome_profile_path = val; break;
      case "illustration_style": config.illustration_style = val; break;
      case "illustration_density": config.illustration_density = val; break;
      case "illustration_image_count": {
        const count = toPositiveInt(val);
        if (count !== undefined) config.illustration_image_count = count;
        break;
      }
      case "illustration_watermark": config.illustration_watermark = val; break;
      case "illustration_watermark_position": config.illustration_watermark_position = val; break;
      case "illustration_language": config.illustration_language = val; break;
    }
  }

  return config;
}

export function loadWechatExtendConfig(): WechatExtendConfig {
  const paths = [
    path.join(process.cwd(), ".post-to-wechat", "EXTEND.md"),
    path.join(
      process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"),
      "post-to-wechat", "EXTEND.md"
    ),
    path.join(os.homedir(), ".post-to-wechat", "EXTEND.md"),
  ];
  for (const p of paths) {
    try {
      const content = fs.readFileSync(p, "utf-8");
      return parseWechatExtend(content);
    } catch {
      continue;
    }
  }
  return {};
}

function loadEnvFile(envPath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return env;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  return env;
}

interface CredentialSource {
  name: string;
  appIdKey: string;
  appSecretKey: string;
  appId?: string;
  appSecret?: string;
}

export interface LoadedCredentials {
  appId: string;
  appSecret: string;
  source: string;
  skippedSources: string[];
}

function normalizeCredentialValue(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function describeMissingKeys(source: CredentialSource): string {
  const missingKeys: string[] = [];
  if (!source.appId) missingKeys.push(source.appIdKey);
  if (!source.appSecret) missingKeys.push(source.appSecretKey);
  return `${source.name} missing ${missingKeys.join(" and ")}`;
}

function buildCredentialSource(
  name: string,
  values: Record<string, string | undefined>,
  appIdKey: string,
  appSecretKey: string,
): CredentialSource {
  return {
    name,
    appIdKey,
    appSecretKey,
    appId: normalizeCredentialValue(values[appIdKey]),
    appSecret: normalizeCredentialValue(values[appSecretKey]),
  };
}

function resolveCredentialSource(sources: CredentialSource[]): LoadedCredentials {
  const skippedSources: string[] = [];

  for (const source of sources) {
    if (source.appId && source.appSecret) {
      return {
        appId: source.appId,
        appSecret: source.appSecret,
        source: source.name,
        skippedSources,
      };
    }

    if (source.appId || source.appSecret) {
      skippedSources.push(describeMissingKeys(source));
    }
  }

  const partialHint = skippedSources.length > 0
    ? `\nIncomplete credential sources skipped:\n- ${skippedSources.join("\n- ")}`
    : "";

  throw new Error(
    "Missing WECHAT_APP_ID or WECHAT_APP_SECRET.\n" +
    "Set via environment variables or .post-to-wechat/.env file." +
    partialHint
  );
}

export function loadCredentials(): LoadedCredentials {
  const cwdEnvPath = path.join(process.cwd(), ".post-to-wechat", ".env");
  const homeEnvPath = path.join(os.homedir(), ".post-to-wechat", ".env");
  const cwdEnv = loadEnvFile(cwdEnvPath);
  const homeEnv = loadEnvFile(homeEnvPath);

  const sources: CredentialSource[] = [];

  sources.push(
    buildCredentialSource("process.env", process.env, "WECHAT_APP_ID", "WECHAT_APP_SECRET"),
    buildCredentialSource("<cwd>/.post-to-wechat/.env", cwdEnv, "WECHAT_APP_ID", "WECHAT_APP_SECRET"),
    buildCredentialSource("~/.post-to-wechat/.env", homeEnv, "WECHAT_APP_ID", "WECHAT_APP_SECRET"),
  );

  return resolveCredentialSource(sources);
}
