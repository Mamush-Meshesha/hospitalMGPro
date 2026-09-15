import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../db';
import { Kafka } from 'kafkajs';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../../../shared/stock.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const stockProto = grpc.loadPackageDefinition(packageDefinition).stock as any;
const grpcClient = new stockProto.StockService('localhost:50051', grpc.credentials.createInsecure());

const kafka = new Kafka({ clientId: 'test-client', brokers: ['localhost:29092'] });
const kafkaProducer = kafka.producer();

const REST_URL = 'http://localhost:4000/api/v1/stock/dispatch';

describe('Multi-Protocol Engine E2E', () => {
  let testProductId: number;

  beforeAll(async () => {
    // 1. Clear test DB state for isolation
    await prisma.erp_stock_movement.deleteMany({});
    await prisma.erp_stock_batch.deleteMany({});
    await prisma.erp_warehouse_bin.deleteMany({});
    await prisma.erp_warehouse_zone.deleteMany({});
    await prisma.erp_warehouse.deleteMany({});
    await prisma.erp_branch.deleteMany({});
    await prisma.erp_product.deleteMany({});

    // 2. Seed a Branch, Warehouse, Zone, and Bin
    const branch = await prisma.erp_branch.create({ data: { name: 'Test Branch' } });
    const warehouse = await prisma.erp_warehouse.create({ data: { name: 'Test WH', branch_id: branch.branch_id } });
    const zone = await prisma.erp_warehouse_zone.create({ data: { name: 'Zone A', warehouse_id: warehouse.warehouse_id } });
    const bin = await prisma.erp_warehouse_bin.create({ data: { name: 'Bin 1', zone_id: zone.zone_id } });

    // 3. Seed a Product and 100 units of Stock
    const product = await prisma.erp_product.create({
      data: { name: 'Paracetamol 500mg', concept_id: 9999 }
    });
    testProductId = product.product_id;

    await prisma.erp_stock_batch.create({
      data: {
        product_id: testProductId,
        bin_id: bin.bin_id,
        batch_number: 'BATCH-001',
        quantity: 100
      }
    });

    await kafkaProducer.connect();
  });

  afterAll(async () => {
    await kafkaProducer.disconnect();
    await prisma.$disconnect();
  });

  it('should dispatch stock via REST API', async () => {
    // Make REST Call
    const response = await fetch(REST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptId: 9999, quantity: 10 })
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.result.status).toBe('DISPATCHED');

    // Verify DB (100 - 10 = 90)
    const batch = await prisma.erp_stock_batch.findFirst({ where: { product_id: testProductId } });
    expect(Number(batch?.quantity)).toBe(90);
  });

  it('should dispatch stock via gRPC', (done) => {
    grpcClient.DispatchStock({ conceptId: 9999, quantity: 20 }, async (err: any, response: any) => {
      expect(err).toBeNull();
      expect(response.status).toBe('DISPATCHED');
      
      // Verify DB (90 - 20 = 70)
      const batch = await prisma.erp_stock_batch.findFirst({ where: { product_id: testProductId } });
      expect(Number(batch?.quantity)).toBe(70);
      done();
    });
  });

  it('should dispatch stock via KAFKA Events', async () => {
    await kafkaProducer.send({
      topic: 'emr.pharmacy.events',
      messages: [{ value: JSON.stringify({ type: 'DRUG_DISPENSED', payload: { conceptId: 9999, quantity: 15 } }) }]
    });

    // Wait 2 seconds for Kafka Consumer to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify DB (70 - 15 = 55)
    const batch = await prisma.erp_stock_batch.findFirst({ where: { product_id: testProductId } });
    expect(Number(batch?.quantity)).toBe(55);
  }, 10000); // Higher timeout for Kafka
});
