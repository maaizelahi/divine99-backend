import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NamesService } from './names.service';

@ApiTags('names')
@Controller('names')
export class NamesController {
  constructor(private readonly namesService: NamesService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of names' })
  @ApiResponse({
    status: 200,
    description: 'List of names retrieved successfully.',
  })
  getNames(): Array<{ arabic: string; transliteration: string }> {
    return this.namesService.getNames();
  }

  @Get('generate')
  @ApiOperation({ summary: 'Generate content for a list of names' })
  @ApiResponse({ status: 201, description: 'Content generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async generateContent(): Promise<Map<string, string>> {
    const names = this.namesService.getNames();
    return this.namesService.generateContentForAllNames(names);
  }

  @Get('process-sources')
  @ApiOperation({ summary: 'Process source materials' })
  @ApiResponse({
    status: 200,
    description: 'Source materials processed successfully.',
  })
  async processSourceMaterials(): Promise<void> {
    await this.namesService.processSourceMaterials();
  }
}
