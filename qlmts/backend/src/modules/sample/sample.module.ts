import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SampleController],
  providers: [SampleService],
  exports: [SampleService],
})
export class SampleModule {}