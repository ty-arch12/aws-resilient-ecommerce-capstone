const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");

// Initialize SQS Client targeting the local deployment region
const region = process.env.AWS_REGION || "us-east-1";
const sqsClient = new SQSClient({ region });
const queueUrl = process.env.QUEUE_URL;

console.log(`🚀 Worker service started. Listening to queue: ${queueUrl} in region: ${region}`);

async function processOrders() {
  if (!queueUrl) {
    console.error("❌ Error: QUEUE_URL environment variable is missing.");
    process.exit(1);
  }

  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20 // Long polling to minimize API cost & CPU cycles
  };

  while (true) {
    try {
      const data = await sqsClient.send(new ReceiveMessageCommand(params));
      
      if (data.Messages && data.Messages.length > 0) {
        for (const message of data.Messages) {
          console.log(`📦 Processing Order ID: ${message.Body}`);
          
          // Simulate transactional order-processing execution logic
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Successfully processed; safely purge the message from the queue
          await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle
          }));
          console.log(`✅ Order ${message.MessageId} processed and cleared from queue.`);
        }
      }
    } catch (error) {
      console.error("🚨 Error receiving/processing queue payload:", error);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Cool-down period before retrying
    }
  }
}

processOrders();
