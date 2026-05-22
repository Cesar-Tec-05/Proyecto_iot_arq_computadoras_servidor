import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject } from 'rxjs';

// Servicio que maneja la lógica relacionada con el ESP, incluyendo control de estado y logs de acciones realizadas.
@Injectable()
export class EspService {

  // URL base del ESP y timeout para las solicitudes, configurables mediante variables de entorno
  private readonly espBaseUrl = (process.env.ESP_BASE_URL ?? 'http://192.168.4.1:80').replace(/\/$/, '');
  private readonly espTimeoutMs = Number(process.env.ESP_TIMEOUT_MS ?? '3000');

  // Inyección del modelo de Mongoose para manejar los logs del ESP
  private readonly logsSubject = new Subject<any>();
  public readonly logs$ = this.logsSubject.asObservable();

  constructor(@InjectModel('Esp') private espModel: Model<any>) {}

  // Método para encender o apagar la cerradura del ESP, realiza una solicitud HTTP al dispositivo y registra la acción en los logs
  async stateEsp(action: 'on' | 'off') {
    const url = new URL(`/rele?state=${action}`, this.espBaseUrl).toString();
    try {
      const res = await axios.get(url, { timeout: this.espTimeoutMs });
      // No crear log desde el servidor al disparar el rele para evitar duplicados:
      // el ESP debería notificar su nuevo estado a través de POST /esp/receive-state
      return res.data;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      throw new HttpException(
        `Error comunicando con ESP (${url}) con timeout ${this.espTimeoutMs}ms: ${msg}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // Método para crear un log de acción del ESP, guardando la acción realizada, su fuente y el timestamp
  async createLog(payload: { action: 'on' | 'off'; source?: string; timestamp?: string | Date }) {
    const doc = new this.espModel({
      action: payload.action,
      source: payload.source ?? 'esp',
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    });
    const saved = await doc.save();
    // Emitir el nuevo log para suscriptores en tiempo real
    try {
      this.logsSubject.next(saved);
    } catch (e) {
      // no bloquear por errores de emisión
    }
    return saved;
  }

  // Método para obtener los logs de acciones del ESP, ordenados por fecha descendente y limitados.
  async getLogs(limit = 100) {
    return this.espModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }
}
