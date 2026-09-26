import { Consumer } from "kafkajs";
import { kafka } from "../config/kafka";
import { config } from "../config/config";

const consumer: Consumer = kafka.consumer({
  groupId: config.kafkaConsumerGroup,
});

export interface TaskCreatedEvent {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export async function startConsumer() {
  await consumer.connect();

  await consumer.subscribe({
    topic: config.kafkaTopicTaskCreated,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      const event: TaskCreatedEvent = JSON.parse(raw);
      console.log(
        `[kafka:consumer] task.created → id=${event.id} title="${event.title}" partition=${partition}`
      );

      // Future side effects live here:
      //   - send notification
      //   - update analytics
      //   - trigger webhook
      //   - enrich with external data
    },
  });

  console.log("[kafka] consumer started");
}

export async function stopConsumer() {
  await consumer.disconnect();
  console.log("[kafka] consumer stopped");
}