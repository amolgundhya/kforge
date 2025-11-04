import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class ChecksumService {
  calculate(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  verify(buffer: Buffer, checksum: string): boolean {
    const calculated = this.calculate(buffer);
    return calculated === checksum;
  }
}
