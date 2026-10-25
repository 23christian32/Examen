import { generateReportTemplate } from './report.template';

describe('Correo del reporte', () => {
  it('incluye foto publica y todos los datos, escapando HTML del ciudadano', () => {
    const html = generateReportTemplate(
      {
        address: 'Calle <1>',
        description: 'Fuga & agua',
        severity: 'high',
        reporterPhone: '5551234567',
      },
      'https://example.com/reports/fuga.jpg',
    );
    expect(html).toContain('src="https://example.com/reports/fuga.jpg"');
    expect(html).toContain('Calle &lt;1&gt;');
    expect(html).toContain('Fuga &amp; agua');
    expect(html).toContain('Alta');
    expect(html).toContain('5551234567');
  });
});
