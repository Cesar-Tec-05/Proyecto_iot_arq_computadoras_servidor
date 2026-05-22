import { Schema } from 'mongoose';

// Esquema de Mongoose para representar las acciones del ESP, incluyendo la acción realizada, su fuente y el timestamp de la acción.
export const EspSchema = new Schema({
  action: { type: String, required: true },
  source: { type: String, required: true, default: 'esp' },
  timestamp: { type: Date, required: true, default: Date.now },
});
