import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedExtension } from './blocked-extension.entity';
import { BlockedExtensionController } from './blocked-extension.controller';
import { BlockedExtensionService } from './blocked-extension.service';

/**
 * 차단 확장자 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([BlockedExtension])],
  controllers: [BlockedExtensionController],
  providers: [BlockedExtensionService],
  exports: [BlockedExtensionService],
})
export class BlockedExtensionModule {}

