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
} from '@nestjs/common';
import { Express, Response } from 'express';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/api')
export class AppController {
  constructor(private readonly _appService: AppService) {}

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
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const awsRes = await this._appService.uploadImage(file);
    if (awsRes.statusCode === HttpStatus.OK) {
      res.statusCode = HttpStatus.OK;
      res.send({
        fileName: awsRes.fileName,
      });
      return;
    }

    res.statusCode = awsRes.statusCode;
    res.send({
      error: awsRes.errorMessage,
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
    res.send({
      message: awsRes.errorMessage,
    });
  }

  @Delete(':fileName')
  deleteImage(@Param('fileName') fileName: string) {
    return this._appService.deleteImage(fileName);
  }
}
