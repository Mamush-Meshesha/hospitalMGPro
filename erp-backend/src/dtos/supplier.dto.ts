import { IsNotEmpty, IsString, IsOptional, MaxLength, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Supplier name is required' })
  @IsString({ message: 'Supplier name must be a string' })
  @MaxLength(255, { message: 'Supplier name cannot exceed 255 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Tax ID must be a string' })
  @MaxLength(100, { message: 'Tax ID cannot exceed 100 characters' })
  tax_id?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email' })
  @MaxLength(255)
  contact_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact_phone?: string;

  @IsOptional()
  @IsString()
  status?: string = 'ACTIVE';
}

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tax_id?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
