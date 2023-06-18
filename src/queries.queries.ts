/** Types generated for queries found in "src/queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetCollections' parameters type */
export type IGetCollectionsParams = void;

/** 'GetCollections' return type */
export interface IGetCollectionsResult {
  collection_id: string;
  name: string | null;
}

/** 'GetCollections' query type */
export interface IGetCollectionsQuery {
  params: IGetCollectionsParams;
  result: IGetCollectionsResult;
}

const getCollectionsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT collection_id, name FROM collections"};

/**
 * Query generated from SQL:
 * ```
 * SELECT collection_id, name FROM collections
 * ```
 */
export const getCollections = new PreparedQuery<IGetCollectionsParams,IGetCollectionsResult>(getCollectionsIR);


/** 'GetCollection' parameters type */
export interface IGetCollectionParams {
  collectionId?: string | null | void;
}

/** 'GetCollection' return type */
export interface IGetCollectionResult {
  collection_id: string;
  name: string | null;
}

/** 'GetCollection' query type */
export interface IGetCollectionQuery {
  params: IGetCollectionParams;
  result: IGetCollectionResult;
}

const getCollectionIR: any = {"usedParamSet":{"collectionId":true},"params":[{"name":"collectionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":66,"b":78}]}],"statement":"SELECT collection_id, name FROM collections WHERE collection_id = :collectionId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT collection_id, name FROM collections WHERE collection_id = :collectionId
 * ```
 */
export const getCollection = new PreparedQuery<IGetCollectionParams,IGetCollectionResult>(getCollectionIR);


/** 'GetCollectionImages' parameters type */
export interface IGetCollectionImagesParams {
  collectionId?: string | null | void;
}

/** 'GetCollectionImages' return type */
export interface IGetCollectionImagesResult {
  collection_id: string | null;
  image_id: string;
  image_url: string | null;
  prompt: string | null;
}

/** 'GetCollectionImages' query type */
export interface IGetCollectionImagesQuery {
  params: IGetCollectionImagesParams;
  result: IGetCollectionImagesResult;
}

const getCollectionImagesIR: any = {"usedParamSet":{"collectionId":true},"params":[{"name":"collectionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":43,"b":55}]}],"statement":"SELECT * FROM images WHERE collection_id = :collectionId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM images WHERE collection_id = :collectionId
 * ```
 */
export const getCollectionImages = new PreparedQuery<IGetCollectionImagesParams,IGetCollectionImagesResult>(getCollectionImagesIR);


/** 'GetActiveCollection' parameters type */
export type IGetActiveCollectionParams = void;

/** 'GetActiveCollection' return type */
export interface IGetActiveCollectionResult {
  collection_id: string;
  name: string | null;
}

/** 'GetActiveCollection' query type */
export interface IGetActiveCollectionQuery {
  params: IGetActiveCollectionParams;
  result: IGetActiveCollectionResult;
}

const getActiveCollectionIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT collection_id, name FROM collections INNER JOIN app ON collections.collection_id = app.active_collection"};

/**
 * Query generated from SQL:
 * ```
 * SELECT collection_id, name FROM collections INNER JOIN app ON collections.collection_id = app.active_collection
 * ```
 */
export const getActiveCollection = new PreparedQuery<IGetActiveCollectionParams,IGetActiveCollectionResult>(getActiveCollectionIR);


/** 'InsertImage' parameters type */
export interface IInsertImageParams {
  collectionId?: string | null | void;
  imageId?: string | null | void;
  imageUrl?: string | null | void;
  prompt?: string | null | void;
}

/** 'InsertImage' return type */
export type IInsertImageResult = void;

/** 'InsertImage' query type */
export interface IInsertImageQuery {
  params: IInsertImageParams;
  result: IInsertImageResult;
}

const insertImageIR: any = {"usedParamSet":{"prompt":true,"collectionId":true,"imageId":true,"imageUrl":true},"params":[{"name":"prompt","required":false,"transform":{"type":"scalar"},"locs":[{"a":72,"b":78}]},{"name":"collectionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":81,"b":93}]},{"name":"imageId","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":103}]},{"name":"imageUrl","required":false,"transform":{"type":"scalar"},"locs":[{"a":106,"b":114}]}],"statement":"INSERT INTO images (prompt, collection_id, image_id, image_url) VALUES (:prompt, :collectionId, :imageId, :imageUrl)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO images (prompt, collection_id, image_id, image_url) VALUES (:prompt, :collectionId, :imageId, :imageUrl)
 * ```
 */
export const insertImage = new PreparedQuery<IInsertImageParams,IInsertImageResult>(insertImageIR);


