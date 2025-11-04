import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generate(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        type: 'image/png',
        width: 200,
        margin: 1
      });
    } catch (error) {
      console.error('QR code generation failed:', error);
      return '';
    }
  }
}
