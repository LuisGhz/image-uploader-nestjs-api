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
} from '@aws-sdk/client-s3';
import config from './config';
import { Readable } from 'stream';
import { GetObjectRes } from './models/get-object-res';

@Injectable()
export class AppService {
  private _logger = new Logger(AppService.name);
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
      ContentType: file.mimetype,
      ContentLength: file.size,
    };

    const command = new PutObjectCommand(input);

    return this._s3Client.send(command);
  }

  async getImage(fileName: string): Promise<GetObjectRes> {
    const input: GetObjectCommandInput = {
      Bucket: this._config.bucketName,
      Key: `${this._path}${fileName}`,
    };
    let exists = true;
    let res: GetObjectCommandOutput;

    const command = new GetObjectCommand(input);

    try {
      res = await this._s3Client.send(command);
    } catch {
      exists = false;
    }

    if (!exists)
      return {
        exists,
      };

    this._logger.log(res.ContentType);

    const buffer = await this.#bodyToBuffer(res);

    return {
      buffer,
      contentType: res.ContentType,
      exists: true,
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
