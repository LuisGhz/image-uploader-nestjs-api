import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { Express, Response } from 'express';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/api')
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @UseInterceptors(FileInterceptor('image'))
  @Post()
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this._appService.uploadImage(file);
  }

  @Get(':fileName')
  async getImage(@Param('fileName') fileName: string, @Res() res: Response) {
    const awsRes = await this._appService.getImage(fileName);

    if (awsRes.exists) {
      res.attachment(fileName);
      res.writeHead(200, {
        'Content-Type': awsRes.contentType,
        'Content-disposition': `attachment;filename=${fileName}`,
      });
      res.end(awsRes.buffer);
      return;
    }

    res.statusCode = 404;
    res.send({
      message: 'Image not found',
    });
  }

  @Delete(':fileName')
  deleteImage(@Param('fileName') fileName: string) {
    return this._appService.deleteImage(fileName);
  }
}
