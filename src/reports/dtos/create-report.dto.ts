import { IsIn, IsString, Matches, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MinLength(1)
  address!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsIn(['low', 'medium', 'high'])
  severity!: 'low' | 'medium' | 'high';

  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/, {
    message: 'reporterPhone debe ser un telefono valido',
  })
  reporterPhone!: string;
}
