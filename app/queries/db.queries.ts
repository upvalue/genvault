/** Types generated for queries found in "app/queries/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ListWorkspacesQuery' parameters type */
export type IListWorkspacesQueryParams = void;

/** 'ListWorkspacesQuery' return type */
export interface IListWorkspacesQueryResult {
  name: string;
  slug: string;
}

/** 'ListWorkspacesQuery' query type */
export interface IListWorkspacesQueryQuery {
  params: IListWorkspacesQueryParams;
  result: IListWorkspacesQueryResult;
}

const listWorkspacesQueryIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM workspaces"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM workspaces
 * ```
 */
export const listWorkspacesQuery = new PreparedQuery<IListWorkspacesQueryParams,IListWorkspacesQueryResult>(listWorkspacesQueryIR);


/** 'InsertWorkspaceMutation' parameters type */
export interface IInsertWorkspaceMutationParams {
  name?: string | null | void;
  slug?: string | null | void;
}

/** 'InsertWorkspaceMutation' return type */
export type IInsertWorkspaceMutationResult = void;

/** 'InsertWorkspaceMutation' query type */
export interface IInsertWorkspaceMutationQuery {
  params: IInsertWorkspaceMutationParams;
  result: IInsertWorkspaceMutationResult;
}

const insertWorkspaceMutationIR: any = {"usedParamSet":{"slug":true,"name":true},"params":[{"name":"slug","required":false,"transform":{"type":"scalar"},"locs":[{"a":44,"b":48}]},{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":51,"b":55}]}],"statement":"INSERT INTO workspaces (slug, name) VALUES (:slug, :name)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO workspaces (slug, name) VALUES (:slug, :name)
 * ```
 */
export const insertWorkspaceMutation = new PreparedQuery<IInsertWorkspaceMutationParams,IInsertWorkspaceMutationResult>(insertWorkspaceMutationIR);


/** 'GetWorkspaceQuery' parameters type */
export interface IGetWorkspaceQueryParams {
  slug?: string | null | void;
}

/** 'GetWorkspaceQuery' return type */
export interface IGetWorkspaceQueryResult {
  name: string;
  slug: string;
}

/** 'GetWorkspaceQuery' query type */
export interface IGetWorkspaceQueryQuery {
  params: IGetWorkspaceQueryParams;
  result: IGetWorkspaceQueryResult;
}

const getWorkspaceQueryIR: any = {"usedParamSet":{"slug":true},"params":[{"name":"slug","required":false,"transform":{"type":"scalar"},"locs":[{"a":38,"b":42}]}],"statement":"SELECT * FROM workspaces WHERE slug = :slug"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM workspaces WHERE slug = :slug
 * ```
 */
export const getWorkspaceQuery = new PreparedQuery<IGetWorkspaceQueryParams,IGetWorkspaceQueryResult>(getWorkspaceQueryIR);


