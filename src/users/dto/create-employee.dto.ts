import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { RoleName } from 'generated/prisma/enums';

export class CreateEmployeeDto {
  /**
   * Employee name
   * example: Mohsin Raza
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Employee email
   * example: mohsin@gmail.com
   */
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Employee temporary password
   * example: password
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  /**
   * Employee role
   * example: inventry manager, salesman
   */
  @IsEnum(RoleName)
  @IsNotEmpty()
  roleName: RoleName;

  /**
   * Employee phone no
   * example: 0354756465454
   */
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @MaxLength(15)
  phone: string;
}
