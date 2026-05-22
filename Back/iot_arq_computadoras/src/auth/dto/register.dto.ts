import { IsString, MinLength } from 'class-validator';

// DTO para manejar datos de registro.
export class RegisterDto {
    @IsString()
    @MinLength(3)
    username!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}
