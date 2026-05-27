import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EspService } from './esp.service.js';
import { EspDto } from '../dto/esp.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Controlador para manejar las rutas relacionadas con el ESP y Servicio
@Controller('esp')
export class EspController {
  constructor(private readonly espService: EspService) {}

  // Endpoint para encender o apagar la cerradura del ESP, protegido por JWT
  @Get('rele')
  @UseGuards(JwtAuthGuard)
  async stateEspRele(@Query('state') state: 'on' | 'off') {
    if (state !== 'on' && state !== 'off') {
      return { error: 'state debe ser "on" u "off"' };
    }
    return this.espService.stateEsp(state);
  }

  // Endpoint para obtener los logs de acciones del ESP, protegido por JWT
  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async getLogs() {
    return this.espService.getLogs();
  }

  // Endpoint para recibir el estado del ESP (on/off) desde el dispositivo, ruta privada.
  @Post('receive-state')
  async receiveState(@Body() body: EspDto) {
    if (!body.action) {
      return { error: 'action es requerido y debe ser "on" u "off"' };
    }
    return this.espService.createLog({ action: body.action, source: body.source ?? 'esp', timestamp: body.timestamp });
  }
}
