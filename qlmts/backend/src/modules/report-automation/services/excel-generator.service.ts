import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelGeneratorService {
  async generate(data: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    // Add headers
    worksheet.columns = [
      { header: 'Parameter', key: 'parameter', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Unit', key: 'unit', width: 15 },
      { header: 'Verdict', key: 'verdict', width: 15 }
    ];
    
    // Add data rows
    if (data.chemistry) {
      data.chemistry.forEach(item => {
        worksheet.addRow({
          parameter: item.element,
          value: item.result,
          unit: '%',
          verdict: item.verdict
        });
      });
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
