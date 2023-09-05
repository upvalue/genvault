import { ActionArgs, redirect } from "@remix-run/server-runtime";
import child_process from "child_process";
import fs from "fs";
import { Buffer } from "node:buffer";
import path from "path";
import yaml from "yaml";
import { imageProperties } from "~/shapes";
import { getWorkspacePath } from "~/workspace.server";

export const action = async ({ request, params }: ActionArgs) => {
  const form = await request.formData();

  const workspace = params.workspace || ";";

  const workspacePath = getWorkspacePath(workspace);

  const fileName = form.get("fileName");
  const meta = form.get("meta")?.toString() || "";

  const metaParsed = imageProperties.parse(JSON.parse(Buffer.from(meta, "base64").toString("utf-8")));

  const markdownFile = path.join(workspacePath, `${fileName}.md`);
  const imgFileName = `${fileName}.png`;
  const imgFile = path.join(workspacePath, imgFileName);

  // Save image
  const cmdArgs = ["-L", "-o", imgFile, metaParsed.generationUrl];
  console.log(`curl ${cmdArgs}`);
  child_process.execFileSync("curl", cmdArgs);

  // Save markdown file
  const yamlFrontMatter = yaml.stringify(metaParsed);

  fs.writeFileSync(markdownFile, `---\n${yamlFrontMatter}---\n![[${imgFileName}]]`);

  const jsonFile = path.join(workspacePath, `${fileName}.image.wb.json`);

  fs.writeFileSync(jsonFile, JSON.stringify(metaParsed, null, 2));

  return redirect(`/w/${workspace}`);
};
