import { Body, Controller, Get, Post, Query, UseGuards, Sse, Req, UnauthorizedException } from '@nestjs/common';
import { EspService } from './esp.service.js';
import { EspDto } from '../dto/esp.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';

// Controlador para manejar las rutas relacionadas con el ESP y Servicio
@Controller('esp')
export class EspController {
  constructor(private readonly espService: EspService, private readonly jwtService: JwtService) {}

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

  // SSE: stream de logs en tiempo real (requiere JWT)
  @Sse('logs/stream')
  @UseGuards(JwtAuthGuard)
  streamLogs(@Req() req: any): Observable<any> {
    // EventSource cannot set Authorization header — aceptar token por query param `?token=...` como alternativa
    const tokenFromQuery = req.query?.token as string | undefined;
    const bearer = req.headers?.authorization as string | undefined;
    const token = tokenFromQuery ?? (bearer ? bearer.split(' ')[1] : undefined);
    if (!token) {
      throw new UnauthorizedException('Token JWT requerido en query param `token` o header Authorization');
    }
    try {
      this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (e) {
      throw new UnauthorizedException('Token JWT inválido para SSE');
    }
    return this.espService.logs$.pipe(map((payload) => ({ data: payload })));
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
