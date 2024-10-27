import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NamesService } from './names.service';
import { NamesController } from './names.controller';
import { NameContent } from './name-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NameContent])],
  providers: [NamesService],
  controllers: [NamesController],
})
export class NamesModule {}
