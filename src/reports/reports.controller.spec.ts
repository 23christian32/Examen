/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
jest.mock('../config/envs', () => ({ envs: {} }));

describe('Reports multipart API', () => {
  const service = {
    create: jest.fn().mockResolvedValue({
      id: 1,
      photoUrl: 'https://example.com/reports/photo.png',
      repairPhotoUrl: null,
    }),
    findAll: jest.fn().mockResolvedValue([]),
  };
  const dto = {
    address: 'Calle 1',
    description: 'Fuga grande',
    severity: 'high',
    reporterPhone: '5551234567',
  };

  it('rechaza reportes sin foto', () => {
    const controller = new ReportsController(
      service as unknown as ReportsService,
    );
    expect(() => controller.create(dto as never)).toThrow(BadRequestException);
    expect(service.create).not.toHaveBeenCalled();
  });

  it('recibe multipart y valida los campos antes de crear', async () => {
    const module = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: service }],
    }).compile();
    const app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    try {
      await request(app.getHttpServer())
        .post('/reports')
        .field(dto)
        .expect(400);
      await request(app.getHttpServer())
        .post('/reports')
        .field({ ...dto, severity: 'invalid' })
        .attach('photo', Buffer.from('photo'), 'photo.png')
        .expect(400);
      const response = await request(app.getHttpServer())
        .post('/reports')
        .field(dto)
        .attach('photo', Buffer.from('photo'), {
          filename: 'photo.png',
          contentType: 'image/png',
        })
        .expect(201);
      expect(response.body).toMatchObject({
        photoUrl: expect.any(String),
        repairPhotoUrl: null,
      });
      expect(service.create).toHaveBeenCalledWith(
        dto,
        expect.objectContaining({
          originalname: 'photo.png',
          buffer: expect.any(Buffer),
        }),
      );
    } finally {
      await app.close();
    }
  });
});
