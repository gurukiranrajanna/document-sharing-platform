import { Kafka, logLevel } from "kafkajs";
import { config } from "./config";

export const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: [config.kafkaBroker],
  logLevel: logLevel.ERROR,
});