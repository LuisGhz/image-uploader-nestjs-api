export interface GetObjectRes {
  statusCode: number;
  errorMessage?: string;
  buffer?: Buffer;
  contentType?: string;
}
