import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../enums/user-role.enum";

export class CreateUserDto {
    @ApiProperty({
        description: 'O nome do usuário',
        example: 'João da Silva',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

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

    @ApiProperty({
        description: 'O cargo do usuário',
        example: 'EMPLOYEE',
        enum: UserRole,
        default: UserRole.EMPLOYEE,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiProperty({
        description: 'IDs das lojas associadas ao usuário',
        example: [1, 2],
        type: [Number],
        required: false,
    })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    storeIds?: number[];
}