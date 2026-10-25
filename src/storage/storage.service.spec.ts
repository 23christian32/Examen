import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  afterEach(() => jest.restoreAllMocks());
  it('sube bytes a reports/ y devuelve URL publica sin ACL', async () => {
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_S3_BUCKET = 'test-aguafix';
    const send = jest
      .spyOn(S3Client.prototype, 'send')
      .mockImplementation(() => Promise.resolve({}) as never);
    const file = {
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
      mimetype: 'image/jpeg',
      size: 4,
    } as Express.Multer.File;
    const url = await new StorageService().uploadFile(file, 'reports/');
    expect(url).toMatch(
      /^https:\/\/test-aguafix.s3.us-east-1.amazonaws.com\/reports\/.+\.jpg$/,
    );
    const command = send.mock.calls[0][0] as PutObjectCommand;
    expect(command.input).toMatchObject({
      Bucket: 'test-aguafix',
      Body: file.buffer,
      ContentType: 'image/jpeg',
    });
    expect(command.input.ACL).toBeUndefined();
  });

  it('rechaza archivos disfrazados de imagen sin enviarlos a S3', async () => {
    const send = jest.spyOn(S3Client.prototype, 'send');
    await expect(
      new StorageService().uploadFile(
        {
          buffer: Buffer.from('texto'),
          mimetype: 'image/png',
          size: 5,
        } as Express.Multer.File,
        'reports/',
      ),
    ).rejects.toThrow('imagen');
    expect(send).not.toHaveBeenCalled();
  });
});
