import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('document')
  @ApiOperation({ summary: 'Upload a document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.UPLOAD_PATH || './uploads';
          const { existsSync, mkdirSync } = require('fs');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uploadService = new UploadService();
          const fileName = uploadService.generateFileName(file.originalname, 'doc');
          cb(null, fileName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<{ url: string; fileName: string }>> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const validation = this.uploadService.validateFile(file);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const fileUrl = this.uploadService.getFileUrl(file.filename);

    return {
      success: true,
      result: {
        url: fileUrl,
        fileName: file.filename,
      },
      message: 'File uploaded successfully',
    };
  }
}
