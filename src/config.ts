import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath();
  const rawData = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  fs.writeFileSync(filePath, JSON.stringify(rawData, null, 2));
}

function validateConfig(rawConfig: any): Config {
  if (!rawConfig || typeof rawConfig !== "object") {
    throw new Error("Invalid config format");
  }
  if (typeof rawConfig.db_url !== "string") {
    throw new Error("db_url must be a string");
  }
  return {
    dbUrl: rawConfig.db_url,
    currentUserName: typeof rawConfig.current_user_name === "string" ? rawConfig.current_user_name : undefined,
  };
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  if (!fs.existsSync(filePath)) {
    throw new Error("Config file not found");
  }
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const rawData = JSON.parse(fileContent);
  return validateConfig(rawData);
}

export function setUser(username: string): void {
  const cfg = readConfig();
  cfg.currentUserName = username;
  writeConfig(cfg);
}
