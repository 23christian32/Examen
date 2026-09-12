import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { generateReportTemplate } from './templates/report.template';
import { EmailService } from '../email/email.service';
import { envs } from '../config/envs';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create(dto);
    const saved = await this.reportRepository.save(report);

    // No se espera el envio del correo: si el SMTP esta lento o caido, el
    // reporte del ciudadano ya quedo guardado y la respuesta no se demora.
    this.notifyMaintenanceCrew(saved, dto);

    return saved;
  }

  private notifyMaintenanceCrew(saved: Report, dto: CreateReportDto): void {
    this.emailService
      .sendEmail(
        envs.MAINTENANCE_EMAIL,
        `Nuevo reporte de fuga - ${dto.address}`,
        generateReportTemplate(dto),
      )
      .catch((error: Error) => {
        this.logger.warn(
          `No se pudo enviar el correo de aviso para el reporte ${saved.id}: ${error.message}`,
        );
      });
  }

  findAll(): Promise<Report[]> {
    return this.reportRepository.find();
  }
}
