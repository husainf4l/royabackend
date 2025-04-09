import { 
  Controller, 
  Post, 
  Body, 
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalyticsService } from './analytics.service';
import { AnalyticsDataDto } from './dto/analytics-data.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAnalytics(
    
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), 
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    ) 
    file: Express.Multer.File,
    @Body() body:any
  ) {
    return this.analyticsService.processAnalyticsUpload(file, body);
  }

  @Post('upload-raw')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRawFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    console.log('Received file:', file);

    const savedPath = await this.analyticsService.saveUploadedFile(file);
    return {
      
      success: true,
      filePath: savedPath,
      metadata: body
    };
  }
}
