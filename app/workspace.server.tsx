import child_process from "child_process";
import frontMatter from "front-matter";
import fs from "fs";
import path from "path";

import { find } from "lodash";
import _ from "lodash";
import yaml from "yaml";
import { WorkspaceProperties, workspaceProperties } from "./shapes";

const STORAGE_PATH = process.env.STORAGE_PATH || "./storage";

type WorkspaceImage = {
  name: string;
  imageFile: string;
};

let workspaces: {
  [name: string]: WorkspaceProperties & {
    path: string;
    images: WorkspaceImage[];
  };
} = {};

const indexWorkspace = (folder: string) => {
  // Find all files within workspace ending in md
  const findResults = child_process.execFileSync("find", [
    folder,
    "-type",
    "f",
    "-name",
    "*.image.wb.json",
  ]).toString().split("\n").filter((n: string) => n.length > 0);

  console.log(findResults);

  return {
    images: findResults.map(image => {
      const imageName = (image.split(path.sep).slice(-1)[0]).replace(".image.wb.json", "");

      return {
        name: imageName,
        imageFile: `${imageName}.png`,
      };
    }),
  };
};

const rebuildIndex = () => {
  // Find all workspaces
  const findResults = child_process.execFileSync("find", [
    STORAGE_PATH,
    "-type",
    "d",
    "-exec",
    "sh",
    "-c",
    "test -f \"$0/Workspace.md\"",
    "{}",
    ";",
    "-print",
  ]).toString().split("\n").filter((n: string) => n.length > 0).map(n => {
    return n.replace(STORAGE_PATH + "/", "");
  });

  workspaces = {};

  findResults.forEach(workspace => {
    const properties = loadWorkspaceProperties(workspace);

    const workspaceIndex = indexWorkspace(path.join(STORAGE_PATH, workspace));

    workspaces[properties.name] = {
      path: path.join(STORAGE_PATH, workspace),
      images: workspaceIndex.images,
      ...properties,
    };
  });
};

export const getWorkspace = (name: string) => {
  if (Object.keys(workspaces).length === 0) rebuildIndex();
  const workspace = _.values(workspaces).find(w => w.name === name);

  if (!workspace) {
    throw new Error(`Workspace ${name} not found`);
  }

  return workspace;
};

export const getWorkspaces = () => {
  if (Object.keys(workspaces).length > 0) return workspaces;

  rebuildIndex();

  return workspaces;
};

export const loadWorkspaceProperties = (workspace: string) => {
  const workspaceContent = fs.readFileSync(path.join(STORAGE_PATH, workspace, "Workspace.md"));

  const fm = frontMatter(workspaceContent.toString("utf-8"));

  return workspaceProperties.parse(fm.attributes);
};

export const getWorkspaceContents = (workspace: string) => {
  const items = fs.readdirSync(path.join(STORAGE_PATH, workspace));

  return items.filter(n => {
    return n.endsWith("image.wb.json") || n.endsWith("chat.wb.json");
  });
};

export const getWorkspacePath = (workspace: string) => {
  return path.join(STORAGE_PATH, workspace);
};
