import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateHeatDto } from './create-heat.dto';

export class UpdateHeatDto extends PartialType(
  OmitType(CreateHeatDto, ['heatNo', 'supplierId'] as const)
) {
  // Heat number and supplier cannot be changed after creation
  // for traceability integrity
}