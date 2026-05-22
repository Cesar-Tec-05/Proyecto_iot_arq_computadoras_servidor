import { Schema } from 'mongoose';

// Esquema de Mongoose para el modelo de usuario, con campos para username y passwordHash, y timestamps automáticos
export const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);
