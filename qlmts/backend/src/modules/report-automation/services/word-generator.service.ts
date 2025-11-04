import { Injectable } from '@nestjs/common';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow } from 'docx';

@Injectable()
export class WordGeneratorService {
  async generate(content: string, data: any): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Report No: ${data.report_no}`,
                bold: true,
                size: 28
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun(`Date: ${data.report_date}`)
            ]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
  }
}
