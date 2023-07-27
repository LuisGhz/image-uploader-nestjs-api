import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
  Res,
  ParseFilePipeBuilder,
  HttpStatus,
  Inject,
  HttpException,
} from '@nestjs/common';
import { Express, Response } from 'express';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import config from './config';
import { ConfigType } from '@nestjs/config';

@Controller('/api')
export class AppController {
  constructor(
    private readonly _appService: AppService,
    @Inject(config.KEY) private _config: ConfigType<typeof config>,
  ) {}

  @Get('/hello')
  helloWorld() {
    return this._config.hello + ' from aws lightsail';
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 2,
          message: 'Image too large (max size: 2mb).',
        })
        .addFileTypeValidator({
          fileType: new RegExp(/image\/(jpe?g|png|gif)/i),
        })
        .build({
          exceptionFactory(error) {
            if (error.startsWith('Validation failed'))
              error = 'Image not valid.';
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
          },
        }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const awsRes = await this._appService.uploadImage(file);
    if (awsRes.statusCode === HttpStatus.OK) {
      res.statusCode = HttpStatus.OK;
      res.send({
        fileUrl: `${this._config.bucketUrl}${awsRes.fileName}`,
      });
      return;
    }

    res.statusCode = awsRes.statusCode;
    res.statusMessage = 'AWS Error';
    res.send({
      message: awsRes.errorMessage,
    });
  }

  @Get(':fileName')
  async getImage(@Param('fileName') fileName: string, @Res() res: Response) {
    const awsRes = await this._appService.getImage(fileName);

    if (awsRes.errorMessage == null) {
      res.attachment(fileName);
      res.writeHead(awsRes.statusCode, {
        'Content-Type': awsRes.contentType,
        'Content-disposition': `attachment;filename=${fileName}`,
      });
      res.end(awsRes.buffer);
      return;
    }

    res.statusCode = awsRes.statusCode;
    res.statusMessage = 'AWS Error';
    res.send({
      message: awsRes.errorMessage,
    });
  }

  @Delete(':fileName')
  deleteImage(@Param('fileName') fileName: string) {
    return this._appService.deleteImage(fileName);
  }
}
