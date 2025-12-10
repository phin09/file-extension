/**
 * 차단 확장자 추가 요청 DTO
 */
export class CreateBlockedExtensionDto {
  /**
   * 추가할 확장자
   * 예: "exe", ".bat", "COM" (자동으로 정규화됨)
   */
  extension: string;
}

