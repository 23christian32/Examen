import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

@Injectable()
export class StorageService {
  private readonly client = new S3Client({ region: process.env.AWS_REGION });

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const signatures = [
      { mime: 'image/jpeg', ext: 'jpg', bytes: [0xff, 0xd8, 0xff] },
      {
        mime: 'image/png',
        ext: 'png',
        bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      },
      { mime: 'image/webp', ext: 'webp', bytes: [0x52, 0x49, 0x46, 0x46] },
    ];
    const format = signatures.find(
      (item) =>
        item.mime === file.mimetype &&
        item.bytes.every((byte, index) => file.buffer[index] === byte),
    );
    if (
      !format ||
      (format.ext === 'webp' && file.buffer.toString('ascii', 8, 12) !== 'WEBP')
    ) {
      throw new BadRequestException(
        'La foto debe ser una imagen JPEG, PNG o WebP valida',
      );
    }
    if (!file.size || file.size > 5 * 1024 * 1024)
      throw new BadRequestException('La foto debe medir entre 1 byte y 5 MB');
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    if (!bucket || !region)
      throw new Error('Configura AWS_S3_BUCKET y AWS_REGION');
    const key = `${folder.replace(/^\/+|\/+$/g, '')}/${randomUUID()}.${format.ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: format.mime,
      }),
    );
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
