import { BlockedExtension } from '../blocked-extension.entity';

/**
 * 차단 확장자 응답 DTO
 */
export class BlockedExtensionResponseDto {
  id: number;
  extension: string;
  createdAt: string;
  updatedAt: string;

  static fromEntity(entity: BlockedExtension): BlockedExtensionResponseDto {
    return {
      id: entity.id,
      extension: entity.extension,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

