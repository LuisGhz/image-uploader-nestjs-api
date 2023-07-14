import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import config from './config';
import { Readable } from 'stream';
import { GetObjectRes } from './models/get-object-res';
import { AWSResError } from './models/aws-res-error';
import { PutObjectRes } from './models/put-object-res';

@Injectable()
export class AppService {
  private _logger = new Logger(AppService.name);
  private _s3Client = new S3Client({
    credentials: {
      accessKeyId: this._config.accessKey,
      secretAccessKey: this._config.secretKey,
    },
    region: this._config.bucketRegion,
  });
  private _path = 'image-uploader/';

  constructor(@Inject(config.KEY) private _config: ConfigType<typeof config>) {}

  async uploadImage(file: Express.Multer.File): Promise<PutObjectRes> {
    const dateNumber = new Date().getTime();
    const newFileName = `${dateNumber}-${file.originalname}`;
    let awsRes: PutObjectCommandOutput;

    const input: PutObjectCommandInput = {
      Bucket: this._config.bucketName,
      Key: `${this._path}${newFileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    };

    const command = new PutObjectCommand(input);
    try {
      awsRes = await this._s3Client.send(command);
    } catch (error) {
      const err = error as unknown as AWSResError;
      this._logger.error(err.message);
      return {
        statusCode: err.$metadata.httpStatusCode,
        errorMessage: err.message,
      };
    }

    return {
      fileName: newFileName,
      statusCode: awsRes.$metadata.httpStatusCode,
    };
  }

  async getImage(fileName: string): Promise<GetObjectRes> {
    const input: GetObjectCommandInput = {
      Bucket: this._config.bucketName,
      Key: `${this._path}${fileName}`,
    };
    let res: GetObjectCommandOutput;

    const command = new GetObjectCommand(input);

    try {
      res = await this._s3Client.send(command);
    } catch (error) {
      const err = error as unknown as AWSResError;
      this._logger.error(err.message);

      return {
        errorMessage: err.message,
        statusCode: err.$metadata.httpStatusCode,
      };
    }

    const buffer = await this.#bodyToBuffer(res);

    return {
      buffer,
      contentType: res.ContentType,
      statusCode: res.$metadata.httpStatusCode,
    };
  }

  deleteImage(fileName: string) {
    const input: DeleteObjectCommandInput = {
      Key: `${this._path}${fileName}`,
      Bucket: this._config.bucketName,
    };

    const command = new DeleteObjectCommand(input);

    return this._s3Client.send(command);
  }

  #bodyToBuffer(res: GetObjectCommandOutput): Promise<Buffer> {
    const stream = res.Body as Readable;

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
