import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionArgs, json } from "@remix-run/server-runtime";
import _ from "lodash";
import { FormEvent, useCallback, useState } from "react";
import { getWorkspaces } from "~/workspace.server";

export const loader = async () => {
  const workspaces = getWorkspaces();
  return json({ workspaces });
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const name = form.get("name");

  if (name !== "string") {
    throw new Error("not string");
  }

  const workspaces = await getWorkspaces();

  return json({ workspaces });
};

export default function Pages() {
  const data = useLoaderData<typeof loader>();
  const { workspaces } = data;

  return (
    <>
      <div className="drawer drawer-mobile drawer-open ">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-side border-white/10 border-r">
          <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
          <ul className="menu pt-2 w-80 text-base-content">
            {_.values(workspaces).map(w => {
              return (
                <>
                  <li className="mb-1" key={w.name}>
                    <Link to={`/w/${w.name}/main`}>{w.name}</Link>
                  </li>
                  {w.images.map(i => {
                    return (
                      <li className="ml-4 mb-1" key={i.name}>
                        <Link to={`/w/${w.name}/view/${i.name}`}>{i.name}</Link>
                      </li>
                    );
                  })}
                </>
              );
            })}
          </ul>
        </div>
        <div className="drawer-content flex flex-col">
          <main className="flex-1 overflow-y-auto pt-8 px-6 ">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
