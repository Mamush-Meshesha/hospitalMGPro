import { IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class POItemDto {
  @IsNotEmpty()
  @IsNumber()
  product_id!: number;

  @IsNotEmpty()
  @IsNumber()
  quantity_ordered!: number;

  @IsNotEmpty()
  @IsNumber()
  unit_price!: number;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty()
  @IsNumber()
  supplier_id!: number;

  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items!: POItemDto[];
}
