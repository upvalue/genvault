import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";

export const loader = async ({ params }: LoaderArgs) => {
  const { workspace } = params;

  return json({
    workspace,
  });
};

export default function Workspace() {
  const data = useLoaderData<typeof loader>();

  const { workspace } = data;

  return (
    <>
      <p>hi this is dog</p>
    </>
  );
}
