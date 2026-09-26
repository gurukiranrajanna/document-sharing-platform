import { Producer } from "kafkajs";
import { kafka } from "../config/kafka";
import { config } from "../config/config";

export const producer: Producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
  console.log("[kafka] producer connected");
}

export interface TaskCreatedEvent {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export async function publishTaskCreated(event: TaskCreatedEvent) {
  await producer.send({
    topic: config.kafkaTopicTaskCreated,
    messages: [
      {
        key: event.id,
        value: JSON.stringify(event),
      },
    ],
  });
  console.log(`[kafka] published task.created → ${event.id}`);
}

export async function disconnectProducer() {
  await producer.disconnect();
  console.log("[kafka] producer disconnected");
}