import { LoaderFunction, redirect, type V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [{ title: "test" }];

export const loader: LoaderFunction = async () => {
  return redirect("/main");
};

export default function Index() {
  return null;
}
