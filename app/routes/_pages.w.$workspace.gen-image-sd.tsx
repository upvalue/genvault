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
  const { workspace } = params;
  const body = await request.formData();
  const prompt = await body.get("prompt");

  const args = sdSchema.parse({
    prompt,
  });

  const ax = axios.create({
    baseURL: process.env.AUX_URL,
    family: 4,
  });

  const res = await ax.post("/api/generate-sd-image", args);

  return json({
    workspace,
    imageUrl: res.data[0],
    prompt,
  });
}

const GenerateImage = ({ prompt }: { prompt?: string }) => {
  const [promptValue, setPromptValue] = useState(prompt || "Astronaut riding a unicorn");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col gap-y-4 mb-4">
      <h2 className="text-xl">Generate Stable Diffusion Image</h2>
      <div className="prose"></div>
      <Form
        method="post"
        onSubmit={() => {
          setSubmitted(true);
        }}
      >
        <label className="text-lg" htmlFor="prompt">Prompt</label>
        <input
          className="input input-bordered w-full mb-4"
          name="prompt"
          type="text"
          value={promptValue}
          onChange={(e) => {
            setPromptValue(e.target.value);
          }}
        />
        <button className="btn btn-primary" type="submit" disabled={submitted}>Generate image</button>
      </Form>
    </div>
  );
};

const SaveImage = (
  { workspaceName: workspace, prompt, imageUrl }: { workspaceName: string; prompt: string; imageUrl: string },
) => {
  const defaultFileName = `${format(new Date(), "yyyy-MM-dd")} ${sanitize(prompt)}`;
  const [fileName, setFileName] = useState(defaultFileName);

  const meta: ImageProperties = {
    backend: "replicate",
    model: modelName,
    modelVersion,
    prompt,
    generationUrl: imageUrl,
    imagePath: `${fileName}.png`,
    generatedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss a"),
    tags: [`wb-workspace-${workspace}`, `wb-image-stable-diffusion`],
    workbook: true,
  };

  const metaEncoded = Buffer.from(JSON.stringify(meta)).toString("base64");

  return (
    <div className="flex flex-col gap-y-4">
      <Form method="post" action={`/w/${workspace}/save-image-sd`}>
        <label className="text-lg" htmlFor="fileName">File name</label>
        <input
          className="input input-bordered w-full mb-4"
          name="fileName"
          type="text"
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
          }}
        />
        <input type="hidden" name="meta" value={metaEncoded} />
        <button className="btn btn-primary" type="submit">Save Image</button>
      </Form>
    </div>
  );
};

export default function GenerateImageSD() {
  const { workspace } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  return (
    <>
      <div className="flex grow">
        <div className="w-1/3">
          <GenerateImage />
          {actionData && (
            <SaveImage
              workspaceName={workspace.name}
              prompt={actionData.prompt}
              imageUrl={actionData.imageUrl}
            />
          )}
        </div>
        <div className="p-4">
          {actionData?.imageUrl
            && <img src={actionData?.imageUrl} width="1024" height="1024" alt="generated image" />}
        </div>
      </div>
    </>
  );
}
