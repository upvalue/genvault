import fs from "fs";
import path from "path";

import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { imageProperties } from "~/shapes";
import { getWorkspace } from "~/workspace.server";

type ImageRenderDetails = {
  prompt: string;
  path: string;
};

export const loader = async ({ params }: LoaderArgs) => {
  const workspaceName = params.workspace || "";
  const workspace = getWorkspace(workspaceName);

  const assetPath = path.join(workspace.path, params.asset || "");

  const imagePropertiesPath = `${assetPath}.image.wb.json`;

  let imageRender: ImageRenderDetails | undefined;

  // Check whether this is an image
  if (fs.existsSync(imagePropertiesPath)) {
    const properties = imageProperties.parse(JSON.parse(fs.readFileSync(imagePropertiesPath, "utf-8")));
    imageRender = {
      prompt: properties.prompt,
      path: params.asset || "",
    };
  }

  return json({
    workspace,
    imageRender,
  });
};

const ImageRender = ({ prompt, path, workspaceName }: ImageRenderDetails & { workspaceName: string }) => {
  return (
    <div>
      <h2 className="text-xl">{prompt}</h2>
      <img src={`/w/${workspaceName}/image/${path}`} />
    </div>
  );
};

export default function Workspace() {
  const data = useLoaderData<typeof loader>();

  const { workspace, imageRender } = data;

  return (
    <>
      {imageRender
        && <ImageRender workspaceName={workspace.name} {...imageRender} />}
    </>
  );
}
