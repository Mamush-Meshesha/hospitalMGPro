import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Kafka } from 'kafkajs';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../../../../shared/stock.proto');
const PROTOCOL = process.env.COMMUNICATION_PROTOCOL || 'REST';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'kafka:9092';
const GRPC_SERVER = process.env.ERP_GRPC_SERVER || 'erp-backend:50051';
const REST_SERVER = process.env.ERP_REST_SERVER || 'http://erp-backend:4000';

export class CommunicationClient {
  private static grpcClient: any;
  private static kafkaProducer: any;

  static async initialize() {
    console.log(`📡 Initializing CommunicationClient with protocol: ${PROTOCOL}`);

    if (PROTOCOL === 'GRPC') {
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
      });
      const stockProto = grpc.loadPackageDefinition(packageDefinition).stock as any;
      this.grpcClient = new stockProto.StockService(GRPC_SERVER, grpc.credentials.createInsecure());
      console.log(`🚀 gRPC Client connected to ${GRPC_SERVER}`);
    } else if (PROTOCOL === 'KAFKA') {
      const kafka = new Kafka({
        clientId: 'emr-backend',
        brokers: [KAFKA_BROKER]
      });
      this.kafkaProducer = kafka.producer();
      await this.kafkaProducer.connect();
      console.log(`🚀 Kafka Producer connected to ${KAFKA_BROKER}`);
    }
  }

  static async dispatchStock(conceptId: number, quantity: number, locationId: number): Promise<any> {
    if (PROTOCOL === 'GRPC') {
      return new Promise((resolve, reject) => {
        this.grpcClient.DispatchStock({ conceptId, quantity, locationId }, (err: any, response: any) => {
          if (err) return reject(err);
          resolve(response);
        });
      });
    } else if (PROTOCOL === 'KAFKA') {
      await this.kafkaProducer.send({
        topic: 'emr.pharmacy.events',
        messages: [{
          value: JSON.stringify({ type: 'DRUG_DISPENSED', payload: { conceptId, quantity, locationId } })
        }]
      });
      return { status: 'DISPATCH_EVENT_SENT_TO_KAFKA' };
    } else {
      // Fallback to REST API
      const response = await fetch(`${REST_SERVER}/api/v1/stock/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId, quantity, locationId })
      });
      if (!response.ok) throw new Error('REST API call failed');
      return await response.json();
    }
  }
}
