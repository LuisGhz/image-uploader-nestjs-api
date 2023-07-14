import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Express } from 'express';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  GetObjectCommandInput,
} from '@aws-sdk/client-s3';
import config from './config';
import { Readable } from 'stream';

@Injectable()
export class AppService {
  private _s3Client = new S3Client({
    credentials: {
      accessKeyId: this._config.accessKey,
      secretAccessKey: this._config.secretKey,
    },
    region: 'us-east-2',
  });
  private _path = 'image-uploader/';

  constructor(@Inject(config.KEY) private _config: ConfigType<typeof config>) {}

  uploadImage(file: Express.Multer.File) {
    const dateNumber = new Date().getTime();

    const input: PutObjectCommandInput = {
      Bucket: this._config.bucketName,
      Key: `${this._path}${dateNumber}-${file.originalname}`,
      Body: file.buffer,
    };

    const command = new PutObjectCommand(input);

    return this._s3Client.send(command);
  }

  async getImage(fileName: string) {
    const input: GetObjectCommandInput = {
      Bucket: this._config.bucketName,
      Key: `${this._path}${fileName}`,
    };

    const command = new GetObjectCommand(input);

    const res = await this._s3Client.send(command);

    const stream = res.Body as Readable;

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.once('end', () => resolve(Buffer.concat(chunks)));
      stream.once('error', reject);
    });
  }

  deleteImage(fileName: string) {
    const input: DeleteObjectCommandInput = {
      Key: `${this._path}${fileName}`,
      Bucket: this._config.bucketName,
    };

    const command = new DeleteObjectCommand(input);

    return this._s3Client.send(command);
  }
}
