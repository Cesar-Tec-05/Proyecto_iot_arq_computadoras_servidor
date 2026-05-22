import { IsString, MinLength } from 'class-validator';

// DTO para manejar datos de login.
export class LoginDto {
    @IsString()
    @MinLength(3)
    username!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}
