import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Kafka } from 'kafkajs';
import path from 'path';
import * as stockService from '../services/stock.service';

import fs from 'fs';

const dockerProtoPath = path.resolve(__dirname, '../../shared/stock.proto');
const localProtoPath = path.resolve(__dirname, '../../../shared/stock.proto');
const PROTO_PATH = fs.existsSync(dockerProtoPath) ? dockerProtoPath : localProtoPath;
const PROTOCOL = process.env.COMMUNICATION_PROTOCOL || 'REST';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'kafka:9092';
const GRPC_PORT = process.env.ERP_GRPC_PORT || '50051';

export class CommunicationServer {
  private static grpcServer: grpc.Server;
  private static kafkaConsumer: any;

  static async initialize() {
    console.log(`📡 Initializing CommunicationServer with protocol: ${PROTOCOL}`);

    if (PROTOCOL === 'GRPC' || PROTOCOL === 'ALL') {
      this.initGrpc();
    } 
    if (PROTOCOL === 'KAFKA' || PROTOCOL === 'ALL') {
      await this.initKafka();
    }
  }

  private static initGrpc() {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
    });
    const stockProto = grpc.loadPackageDefinition(packageDefinition).stock as any;

    this.grpcServer = new grpc.Server();
    this.grpcServer.addService(stockProto.StockService.service, {
      DispatchStock: async (call: any, callback: any) => {
        try {
          const { conceptId, quantity, locationId } = call.request;
          console.log(`[gRPC] Dispatching stock for concept ${conceptId}`);
          const result = await stockService.dispatchStock(Number(conceptId), Number(quantity), Number(locationId));
          callback(null, result);
        } catch (error: any) {
          callback({ code: grpc.status.INTERNAL, message: error.message });
        }
      },
      CheckAvailability: async (call: any, callback: any) => {
        try {
          const { conceptId } = call.request;
          console.log(`[gRPC] Checking availability for concept ${conceptId}`);
          const result = await stockService.checkAvailability(Number(conceptId));
          callback(null, result);
        } catch (error: any) {
          callback({ code: grpc.status.INTERNAL, message: error.message });
        }
      }
    });

    this.grpcServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) throw err;
      this.grpcServer.start();
      console.log(`🚀 gRPC Server running on port ${port}`);
    });
  }

  private static async initKafka() {
    const kafka = new Kafka({
      clientId: 'erp-backend',
      brokers: [KAFKA_BROKER]
    });

    this.kafkaConsumer = kafka.consumer({ groupId: 'erp-group' });

    this.kafkaConsumer.on(this.kafkaConsumer.events.CRASH, async (e: any) => {
      console.error('[Kafka] Consumer crashed, reconnecting...', e);
      setTimeout(() => this.initKafka(), 5000);
    });

    try {
      await this.kafkaConsumer.connect();
      console.log(`🚀 Kafka Consumer connected to ${KAFKA_BROKER}`);

      await this.kafkaConsumer.subscribe({ topic: 'emr.pharmacy.events', fromBeginning: true });

      await this.kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message }: any) => {
          const event = JSON.parse(message.value.toString());
          if (event.type === 'DRUG_DISPENSED') {
            console.log(`[Kafka] Received DRUG_DISPENSED event for concept ${event.payload.conceptId}`);
            try {
              await stockService.dispatchStock(
                Number(event.payload.conceptId), 
                Number(event.payload.quantity), 
                Number(event.payload.locationId)
              );
              console.log(`[Kafka] Stock dispatched successfully`);
            } catch (error: any) {
              console.error(`[Kafka Error] Failed to dispatch stock: ${error.message}`);
            }
          }
        },
      });
    } catch (e: any) {
      console.error(`[Kafka] Initialization error: ${e.message}. Retrying in 5s...`);
      setTimeout(() => this.initKafka(), 5000);
    }
  }
}
