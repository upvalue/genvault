/** Types generated for queries found in "src/queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetChannels' parameters type */
export type IGetChannelsParams = void;

/** 'GetChannels' return type */
export interface IGetChannelsResult {
  name: string;
}

/** 'GetChannels' query type */
export interface IGetChannelsQuery {
  params: IGetChannelsParams;
  result: IGetChannelsResult;
}

const getChannelsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT name FROM channels"};

/**
 * Query generated from SQL:
 * ```
 * SELECT name FROM channels
 * ```
 */
export const getChannels = new PreparedQuery<IGetChannelsParams,IGetChannelsResult>(getChannelsIR);


/** 'GetChannel' parameters type */
export interface IGetChannelParams {
  name?: string | null | void;
}

/** 'GetChannel' return type */
export interface IGetChannelResult {
  name: string;
}

/** 'GetChannel' query type */
export interface IGetChannelQuery {
  params: IGetChannelParams;
  result: IGetChannelResult;
}

const getChannelIR: any = {"usedParamSet":{"name":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":39,"b":43}]}],"statement":"SELECT name FROM channels WHERE name = :name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT name FROM channels WHERE name = :name
 * ```
 */
export const getChannel = new PreparedQuery<IGetChannelParams,IGetChannelResult>(getChannelIR);


/** 'GetChannelImages' parameters type */
export interface IGetChannelImagesParams {
  channelName?: string | null | void;
}

/** 'GetChannelImages' return type */
export interface IGetChannelImagesResult {
  channel: string | null;
  image_url: string | null;
  message_id: string;
  prompt: string | null;
}

/** 'GetChannelImages' query type */
export interface IGetChannelImagesQuery {
  params: IGetChannelImagesParams;
  result: IGetChannelImagesResult;
}

const getChannelImagesIR: any = {"usedParamSet":{"channelName":true},"params":[{"name":"channelName","required":false,"transform":{"type":"scalar"},"locs":[{"a":37,"b":48}]}],"statement":"SELECT * FROM images WHERE channel = :channelName"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM images WHERE channel = :channelName
 * ```
 */
export const getChannelImages = new PreparedQuery<IGetChannelImagesParams,IGetChannelImagesResult>(getChannelImagesIR);


/** 'InsertImage' parameters type */
export interface IInsertImageParams {
  channel?: string | null | void;
  imageUrl?: string | null | void;
  messageId?: string | null | void;
  prompt?: string | null | void;
}

/** 'InsertImage' return type */
export type IInsertImageResult = void;

/** 'InsertImage' query type */
export interface IInsertImageQuery {
  params: IInsertImageParams;
  result: IInsertImageResult;
}

const insertImageIR: any = {"usedParamSet":{"prompt":true,"channel":true,"messageId":true,"imageUrl":true},"params":[{"name":"prompt","required":false,"transform":{"type":"scalar"},"locs":[{"a":68,"b":74}]},{"name":"channel","required":false,"transform":{"type":"scalar"},"locs":[{"a":77,"b":84}]},{"name":"messageId","required":false,"transform":{"type":"scalar"},"locs":[{"a":87,"b":96}]},{"name":"imageUrl","required":false,"transform":{"type":"scalar"},"locs":[{"a":99,"b":107}]}],"statement":"INSERT INTO images (prompt, channel, message_id, image_url) VALUES (:prompt, :channel, :messageId, :imageUrl)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO images (prompt, channel, message_id, image_url) VALUES (:prompt, :channel, :messageId, :imageUrl)
 * ```
 */
export const insertImage = new PreparedQuery<IInsertImageParams,IInsertImageResult>(insertImageIR);


/** 'UpsertChannel' parameters type */
export interface IUpsertChannelParams {
  channel_id?: string | null | void;
  name?: string | null | void;
}

/** 'UpsertChannel' return type */
export type IUpsertChannelResult = void;

/** 'UpsertChannel' query type */
export interface IUpsertChannelQuery {
  params: IUpsertChannelParams;
  result: IUpsertChannelResult;
}

const upsertChannelIR: any = {"usedParamSet":{"name":true,"channel_id":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":48,"b":52}]},{"name":"channel_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":55,"b":65},{"a":114,"b":124}]}],"statement":"INSERT INTO channels (name, channel_id) VALUES (:name, :channel_id) ON CONFLICT (name) DO UPDATE SET channel_id = :channel_id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO channels (name, channel_id) VALUES (:name, :channel_id) ON CONFLICT (name) DO UPDATE SET channel_id = :channel_id
 * ```
 */
export const upsertChannel = new PreparedQuery<IUpsertChannelParams,IUpsertChannelResult>(upsertChannelIR);


