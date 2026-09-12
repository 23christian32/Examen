import { CreateReportDto } from '../dtos/create-report.dto';

const SEVERITY_LABELS: Record<CreateReportDto['severity'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

const SEVERITY_COLORS: Record<CreateReportDto['severity'], string> = {
  low: '#2e7d32',
  medium: '#e65100',
  high: '#c62828',
};

export function generateReportTemplate(dto: CreateReportDto): string {
  const severityLabel = SEVERITY_LABELS[dto.severity];
  const severityColor = SEVERITY_COLORS[dto.severity];

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        <tr>
          <td style="background-color: #1565c0; padding: 16px 24px;">
            <h1 style="margin: 0; color: #ffffff; font-size: 18px;">Nuevo reporte de fuga de agua</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 16px; color: #333333; font-size: 14px;">
              Se registro un nuevo reporte ciudadano en la via publica. Detalles a continuacion:
            </p>
            <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 14px; color: #333333;">
              <tr>
                <td style="border: 1px solid #e0e0e0; font-weight: bold; width: 140px; background-color: #fafafa;">Direccion</td>
                <td style="border: 1px solid #e0e0e0;">${dto.address}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e0e0e0; font-weight: bold; background-color: #fafafa;">Descripcion</td>
                <td style="border: 1px solid #e0e0e0;">${dto.description}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e0e0e0; font-weight: bold; background-color: #fafafa;">Severidad</td>
                <td style="border: 1px solid #e0e0e0;">
                  <span style="color: ${severityColor}; font-weight: bold;">${severityLabel}</span>
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid #e0e0e0; font-weight: bold; background-color: #fafafa;">Telefono de contacto</td>
                <td style="border: 1px solid #e0e0e0;">${dto.reporterPhone}</td>
              </tr>
            </table>
            <p style="margin: 24px 0 0; color: #757575; font-size: 12px;">
              Este correo se genero automaticamente desde el sistema de reportes de fugas del municipio.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
