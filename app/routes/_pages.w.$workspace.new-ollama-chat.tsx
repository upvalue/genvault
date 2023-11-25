import { Form, useActionData, useLoaderData, useLocation } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/server-runtime";
import { sdSchema } from "aux/api";
import axios from "axios";
import { format } from "date-fns";
import { Buffer } from "node:buffer";
import { useState } from "react";
import sanitize from "sanitize-filename";
import { ImageProperties } from "~/shapes";
import { getWorkspace } from "~/workspace.server";

// For now, just hardcoded.
const modelName = "stability-ai/sdxl";
const modelVersion = "d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82";

export const loader = async ({ params }: LoaderArgs) => {
  const workspaceName = params.workspace || "";
  const workspace = getWorkspace(workspaceName);

  return json({
    workspace,
  });
};

export async function action({ request, params }: ActionArgs) {
}

export default function GenerateImageSD() {
  const { workspace } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  return (
    <>
      <div className="flex grow">
        zippity doo dah zippity day
      </div>
    </>
  );
}
