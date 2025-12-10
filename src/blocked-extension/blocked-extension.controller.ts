import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { BlockedExtensionService } from './blocked-extension.service';
import { CreateBlockedExtensionDto } from './dto/create-blocked-extension.dto';
import { BlockedExtensionResponseDto } from './dto/blocked-extension-response.dto';

/**
 * 차단 확장자 API 컨트롤러
 */
@Controller('blocked-extension')
export class BlockedExtensionController {
  constructor(private readonly blockedExtensionService: BlockedExtensionService) {}

  /**
   * 전체 차단 확장자 목록 조회
   * GET /api/blocked-extension
   */
  @Get()
  async findAll() {
    const extensions = await this.blockedExtensionService.findAll();
    const count = await this.blockedExtensionService.count();

    return {
      data: extensions.map((ext) => BlockedExtensionResponseDto.fromEntity(ext)),
      count,
      maxCount: 200,
    };
  }

  /**
   * 차단 확장자 추가
   * POST /api/blocked-extension
   * Body: { extension: string }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateBlockedExtensionDto) {
    const extension = await this.blockedExtensionService.create(createDto);

    return {
      message: '차단 확장자가 추가되었습니다',
      data: BlockedExtensionResponseDto.fromEntity(extension),
    };
  }

  /**
   * 차단 확장자 삭제
   * DELETE /api/blocked-extension/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.blockedExtensionService.remove(id);

    return {
      message: '차단 확장자가 삭제되었습니다',
    };
  }
}

