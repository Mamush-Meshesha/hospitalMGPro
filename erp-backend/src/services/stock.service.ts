import { prisma } from '../db';

export const checkAvailability = async (conceptId: number) => {
  const product = await prisma.erp_product.findFirst({
    where: { concept_id: conceptId }
  });
  if (!product) throw new Error('Product not found in ERP');

  const batches = await prisma.erp_stock_batch.findMany({
    where: { product_id: product.product_id, status: 'ACTIVE' }
  });

  const available = batches.reduce((acc, batch) => acc + Number(batch.quantity), 0);
  return { productId: product.product_id, available };
};

export const dispatchStock = async (conceptId: number, quantity: number, locationId?: number) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.erp_product.findFirst({
      where: { concept_id: conceptId }
    });
    if (!product) throw new Error('Product not found in ERP');

    const batches = await tx.erp_stock_batch.findMany({
      where: { product_id: product.product_id, status: 'ACTIVE', quantity: { gt: 0 } },
      orderBy: { expiration_date: 'asc' } // FEFO
    });

    let remainingToDeduct = Number(quantity);
    let sourceWhId = null;

    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;

      const batchQty = Number(batch.quantity);
      const deduct = Math.min(batchQty, remainingToDeduct);

      await tx.erp_stock_batch.update({
        where: { batch_id: batch.batch_id },
        data: { quantity: batchQty - deduct }
      });
      
      if (!sourceWhId) {
        // Find warehouse of this bin
        const bin = await tx.erp_warehouse_bin.findUnique({
          where: { bin_id: batch.bin_id },
          include: { zone: true }
        });
        if (bin) sourceWhId = bin.zone.warehouse_id;
      }

      remainingToDeduct -= deduct;
    }

    if (remainingToDeduct > 0) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    // Create immutable audit trail
    await tx.erp_stock_movement.create({
      data: {
        product_id: product.product_id,
        source_wh_id: sourceWhId,
        quantity: -Number(quantity),
        reference: `DISPATCH-${Date.now()}`,
        created_by: 1 // Default system user for now
      }
    });

    return { status: 'DISPATCHED', conceptId, quantity };
  });
};
