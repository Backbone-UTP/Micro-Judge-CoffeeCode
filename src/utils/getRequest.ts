import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import 'dotenv/config';

export async function getRequest() {
  const client = new SQSClient({
    region: 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const params = {
    QueueUrl: process.env.SQS_URL,
    MaxNumberOfMessages: 1,
  };

  const command = new ReceiveMessageCommand(params);

  const res = await client.send(command);

  return res.Messages ? res.Messages[0] : {};
}
