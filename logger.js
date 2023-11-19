const amqplib = require("amqplib");
const fs = require("fs-extra");
const path = require("path");
(async () => {
  const conn = await amqplib.connect("amqp://localhost:5672");
  const loggerChannel = await conn.createChannel();
  await loggerChannel.assertQueue("logger");
  loggerChannel.consume("logger", async (event) => {
    const message = JSON.parse(event.content.toString());
    await fs.appendFile(
      path.join(__dirname, "logger2.txt"),
      JSON.stringify(message) + "\n"
    );
  });
})();