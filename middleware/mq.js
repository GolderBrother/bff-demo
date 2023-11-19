const amqp = require("amqplib");
const fs = require("fs-extra");
const path = require("path");
const mqMiddleware = (options = {}) => {
  return async (ctx, next) => {
    //使用 amqp.connect 方法连接 RabbitMQ 服务器
    const rabbitMQClient = await amqp.connect(
      options.url || "amqp://localhost:5672"
    );
    //使用 rabbitMQClient 的 createChannel 方法创建 RabbitMQ 通道
    const logger = await rabbitMQClient.createChannel();
    //使用 logger 的 assertQueue 方法创建名为 "logger" 的队列，如果队列已经存在则不会重复创建
    await logger.assertQueue("logger");
    logger.consume("logger", async (event) => {
      const message = JSON.parse(event.content.toString());
      await fs.appendFile(
        path.join(__dirname, "logger.txt"),
        JSON.stringify(message) + "\n"
      );
    });
    ctx.channels = {
      logger,
    };
    await next();
  };
};
module.exports = mqMiddleware;


