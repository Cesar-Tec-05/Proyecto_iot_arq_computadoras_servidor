import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Servicio que maneja la lógica relacionada con el ESP, incluyendo control de estado y logs de acciones realizadas.
@Injectable()
export class EspService {

  // URL base del ESP y timeout para las solicitudes, configurables mediante variables de entorno
  private readonly espBaseUrl = (process.env.ESP_BASE_URL ?? 'http://192.168.4.1:80').replace(/\/$/, '');
  private readonly espTimeoutMs = Number(process.env.ESP_TIMEOUT_MS ?? '3000');

  constructor(@InjectModel('Esp') private espModel: Model<any>) {}

  // Método para encender o apagar la cerradura del ESP, realiza una solicitud HTTP al dispositivo y registra la acción en los logs
  async stateEsp(action: 'on' | 'off') {
    const url = new URL(`/rele?state=${action}`, this.espBaseUrl).toString();
    try {
      const res = await axios.get(url, { timeout: this.espTimeoutMs });
      await this.createLog({ action, source: 'server' });
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
    const source = payload.source ?? 'esp';
    if (source === 'esp') {
      const recentDuplicate = await this.espModel
        .findOne({ action: payload.action })
        .sort({ timestamp: -1 })
        .lean<{ timestamp: Date }>();
      if (recentDuplicate) {
        const currentTimestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
        const previousTimestamp = new Date(recentDuplicate.timestamp);
        const diffMs = Math.abs(currentTimestamp.getTime() - previousTimestamp.getTime());
        if (diffMs < 5000) {
          return recentDuplicate;
        }
      }
    }
    const doc = new this.espModel({
      action: payload.action,
      source,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    });
    return doc.save();
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
