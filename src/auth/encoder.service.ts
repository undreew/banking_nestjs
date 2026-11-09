import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncoderService {
  async encrypt(value: string) {
    return await bcrypt.hash(value, 12);
  }

  async decrypt(value: string, encryptedValue: string) {
    return await bcrypt.compare(value, encryptedValue);
  }
}
