import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { UPLOADS_ROOT } from '../storage/upload.util';

// Public, unauthenticated static file serving — matches the dedicated Kong
// route (academic-uploads, priority 200, no jwt plugin) added alongside
// this phase. Do NOT add this controller's routes under AcademicController
// (class-level @UseGuards(JwtAuthGuard, RolesGuard) would require a token).
@ApiTags('academic-uploads')
@Controller('api/v1/academic/uploads')
export class UploadsController {
  @Get('subjects/:filename')
  @ApiOperation({ summary: 'Public: serve a subject image by its server-generated filename' })
  serveSubjectImage(@Param('filename') filename: string, @Res() res: Response) {
    // Filenames are always server-generated (UUID + validated extension) —
    // this regex rejects anything else, including path traversal attempts.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png)$/i.test(filename)) {
      throw new NotFoundException();
    }
    const filePath = path.join(UPLOADS_ROOT, 'subjects', filename);
    if (!fs.existsSync(filePath)) throw new NotFoundException();
    return res.sendFile(filePath);
  }

  @Get('topics/:filename')
  @ApiOperation({ summary: 'Public: serve a topic file (image or document) by its server-generated filename' })
  serveTopicFile(@Param('filename') filename: string, @Res() res: Response) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|pdf|docx|pptx|xlsx)$/i.test(filename)) {
      throw new NotFoundException();
    }
    const filePath = path.join(UPLOADS_ROOT, 'topics', filename);
    if (!fs.existsSync(filePath)) throw new NotFoundException();
    return res.sendFile(filePath);
  }
}
