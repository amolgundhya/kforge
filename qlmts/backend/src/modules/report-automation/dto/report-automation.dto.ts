import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsObject, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  COA = 'COA',
  MTC = 'MTC',
  HT_REPORT = 'HT_REPORT',
  DISPATCH = 'DISPATCH',
  PPAP = 'PPAP',
  CHARPY = 'CHARPY',
  UT_MAP = 'UT_MAP',
}

export enum ReportFormat {
  PDF = 'PDF',
  DOCX = 'DOCX',
  XLSX = 'XLSX',
}

export enum SignatureType {
  PKI = 'PKI',
  SIMPLE = 'SIMPLE',
  TIMESTAMP = 'TIMESTAMP',
}

export enum DistributionChannel {
  EMAIL = 'EMAIL',
  SAP = 'SAP',
  WEBHOOK = 'WEBHOOK',
  PORTAL = 'PORTAL',
  PRINT = 'PRINT',
}

export class GenerateReportDto {
  @ApiProperty({ enum: ReportType, description: 'Type of report to generate' })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({ enum: ReportFormat, description: 'Output format for the report' })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiPropertyOptional({ description: 'Template ID to use (optional)' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: 'Sample ID' })
  @IsOptional()
  @IsString()
  sampleId?: string;

  @ApiPropertyOptional({ description: 'Batch ID' })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({ description: 'Purchase Order ID' })
  @IsOptional()
  @IsString()
  poId?: string;

  @ApiPropertyOptional({ description: 'Auto-release after generation' })
  @IsOptional()
  @IsBoolean()
  autoRelease?: boolean;
}

export class BulkGenerateReportDto {
  @ApiProperty({ description: 'Array of sample/batch IDs to generate reports for' })
  @IsArray()
  @IsString({ each: true })
  reportIds: string[];

  @ApiProperty({ description: 'Common options for all reports' })
  @ValidateNested()
  @Type(() => GenerateReportDto)
  options: Partial<GenerateReportDto>;
}

export class ReissueReportDto {
  @ApiProperty({ description: 'Reason for reissuing the report' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Optional overrides for the reissued report' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GenerateReportDto)
  options?: Partial<GenerateReportDto>;
}

export class PreviewReportDto extends GenerateReportDto {}

export class SignatureDto {
  @ApiProperty({ description: 'Role of the signatory' })
  @IsString()
  role: string;

  @ApiProperty({ enum: SignatureType, description: 'Type of signature' })
  @IsEnum(SignatureType)
  type: SignatureType;

  @ApiPropertyOptional({ description: 'Base64 encoded signature data' })
  @IsOptional()
  @IsString()
  data?: string;

  @ApiPropertyOptional({ description: 'X.509 certificate for PKI signatures' })
  @IsOptional()
  @IsString()
  certificate?: string;
}

export class ReleaseReportDto {
  @ApiPropertyOptional({ description: 'Signatures to add before release' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignatureDto)
  signatures?: SignatureDto[];

  @ApiPropertyOptional({ description: 'Auto-distribute after release' })
  @IsOptional()
  @IsBoolean()
  autoDistribute?: boolean;

  @ApiPropertyOptional({ description: 'Distribution channels if auto-distribute is true' })
  @IsOptional()
  @IsArray()
  @IsEnum(DistributionChannel, { each: true })
  distributionChannels?: DistributionChannel[];

  @ApiPropertyOptional({ description: 'Recipients for distribution' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];
}

export class SignReportDto {
  @ApiProperty({ description: 'Role of the signatory' })
  @IsString()
  role: string;

  @ApiProperty({ enum: SignatureType, description: 'Type of signature' })
  @IsEnum(SignatureType)
  type: SignatureType;

  @ApiPropertyOptional({ description: 'Base64 encoded signature data' })
  @IsOptional()
  @IsString()
  signatureData?: string;

  @ApiPropertyOptional({ description: 'X.509 certificate for PKI signatures' })
  @IsOptional()
  @IsString()
  certificate?: string;
}

export class DistributeReportDto {
  @ApiProperty({ 
    enum: DistributionChannel, 
    isArray: true,
    description: 'Distribution channels' 
  })
  @IsArray()
  @IsEnum(DistributionChannel, { each: true })
  channels: DistributionChannel[];

  @ApiPropertyOptional({ description: 'Recipients (emails, webhook URLs, etc.)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Channel-specific metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class TemplateFieldDto {
  @ApiProperty({ description: 'Field name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Field type' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Field description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is field required' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}