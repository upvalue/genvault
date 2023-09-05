import fs from "fs";
import path from "path";
import { getWorkspace } from "~/workspace.server";

export async function loader({ params }: LoaderArgs) {
  const workspaceName = params.workspace || "";
  const workspace = getWorkspace(workspaceName);

  const imageName = params.path || "";

  const imageData = fs.readFileSync(path.join(workspace.path, `${imageName}.png`));

  return new Response(imageData, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
    },
  });
}
