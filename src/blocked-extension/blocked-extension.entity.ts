import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * 차단된 파일 확장자 엔티티
 */
@Entity('blocked_extension')
export class BlockedExtension {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 확장자 (소문자, 점 없이 저장)
   * 예: "exe", "bat", "custom"
   */
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
  })
  extension: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

