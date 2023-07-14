export interface GetObjectRes {
  exists: boolean;
  buffer?: Buffer;
  contentType?: string;
}
