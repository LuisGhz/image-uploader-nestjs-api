export interface AWSResError {
  name: string;
  $fault: string;
  $metadata: Metadata;
  Code: string;
  Key: string;
  RequestId: string;
  HostId: string;
  message: string;
}

interface Metadata {
  httpStatusCode: number;
  requestId: string;
  extendedRequestId: string;
  attempts: number;
  totalRetryDelay: number;
}
