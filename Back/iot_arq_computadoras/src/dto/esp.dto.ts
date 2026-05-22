import { IsIn, IsOptional, IsString } from 'class-validator';

// Dto para el recurso de encendido/apagado de la ESP32
export class EspDto {
  @IsIn(['on', 'off'])
  action!: 'on' | 'off';

  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
