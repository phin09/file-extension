import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedExtension } from './blocked-extension.entity';
import { CreateBlockedExtensionDto } from './dto/create-blocked-extension.dto';

/**
 * 차단 확장자 관리 서비스
 */
@Injectable()
export class BlockedExtensionService {
  // 커스텀 확장자 최대 개수
  private readonly MAX_CUSTOM_EXTENSIONS = 200;

  constructor(
    @InjectRepository(BlockedExtension)
    private readonly blockedExtensionRepository: Repository<BlockedExtension>,
  ) {}

  /**
   * 확장자 정규화
   * - 소문자 변환
   * - prefix 점(.) 제거
   * - 공백 제거
   */
  private normalizeExtension(extension: string): string {
    return extension.trim().toLowerCase().replace(/^\.+/, '');
  }

  /**
   * 전체 차단 확장자 목록 조회
   */
  async findAll(): Promise<BlockedExtension[]> {
    return this.blockedExtensionRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 차단 확장자 추가
   */
  async create(createDto: CreateBlockedExtensionDto): Promise<BlockedExtension> {
    // 입력 검증
    if (!createDto.extension || createDto.extension.trim().length === 0) {
      throw new BadRequestException('확장자를 입력해주세요');
    }

    // 확장자 정규화
    const normalized = this.normalizeExtension(createDto.extension);

    // 길이 검증
    if (normalized.length === 0) {
      throw new BadRequestException('유효한 확장자를 입력해주세요');
    }

    if (normalized.length > 20) {
      throw new BadRequestException('확장자는 최대 20자까지 입력 가능합니다');
    }

    // 최대 개수 제한 검증
    const count = await this.blockedExtensionRepository.count();
    if (count >= this.MAX_CUSTOM_EXTENSIONS) {
      throw new BadRequestException(
        `최대 ${this.MAX_CUSTOM_EXTENSIONS}개까지만 등록 가능합니다`,
      );
    }

    // 중복 검증
    const existing = await this.blockedExtensionRepository.findOne({
      where: { extension: normalized },
    });

    if (existing) {
      throw new ConflictException('이미 등록된 확장자입니다');
    }

    // 저장
    const blockedExtension = this.blockedExtensionRepository.create({
      extension: normalized,
    });

    return this.blockedExtensionRepository.save(blockedExtension);
  }

  /**
   * 차단 확장자 삭제
   */
  async remove(id: number): Promise<void> {
    const result = await this.blockedExtensionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('해당 확장자를 찾을 수 없습니다');
    }
  }

  /**
   * 현재 등록된 확장자 개수 조회
   */
  async count(): Promise<number> {
    return this.blockedExtensionRepository.count();
  }
}

