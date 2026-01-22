import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: 'O email do usuário',
        example: 'joao@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'A senha do usuário',
        example: 'password123',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
