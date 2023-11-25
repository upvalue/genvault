import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { getWorkspace } from "~/workspace.server";

export const loader = async ({ params }: LoaderArgs) => {
  const workspaceName = params.workspace || "";

  const workspace = getWorkspace(workspaceName);

  return json({
    workspace,
  });
};

export default function Workspace() {
  const data = useLoaderData<typeof loader>();

  const { workspace } = data;

  return (
    <>
      <div className="flex gap-x-2 items-center mb-4">
        <h1 className="text-2xl text-white">{workspace.name}</h1>
        <Link to={`/w/${workspace.name}/gen-image-sd`} className="btn btn-primary btn-sm">
          + Stable Diffusion Image
        </Link>
        <Link to={`/w/${workspace.name}/new-ollama-chat`} className="btn btn-primary btn-sm">
          + Ollama Chat
        </Link>
      </div>
      <Outlet />
    </>
  );
}
