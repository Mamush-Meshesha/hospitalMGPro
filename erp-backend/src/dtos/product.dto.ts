import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsNumber()
  concept_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  is_drug?: boolean = true;

  @IsOptional()
  @IsBoolean()
  has_expiration?: boolean = true;

  @IsOptional()
  @IsNumber()
  reorder_level?: number = 0;

  @IsOptional()
  @IsNumber()
  purchase_uom_id?: number;

  @IsOptional()
  @IsNumber()
  store_uom_id?: number;
}
