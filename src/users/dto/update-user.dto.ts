import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateUserDto extends PartialType(CreateEmployeeDto) {}
