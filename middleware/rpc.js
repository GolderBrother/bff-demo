const {
  client: { RpcClient },
  registry: { ZookeeperRegistry },
} = require("sofa-rpc-node");
const rpcMiddleware = (options = {}) => {
  return async function (ctx, next) {
    const logger = options.logger || console;
    //创建 ZookeeperRegistry 类的实例，用于管理服务发现和注册
    const registry = new ZookeeperRegistry({
      logger,
      address: options.address || "127.0.0.1:2181",
    });
    //创建 RpcClient 类的实例，用于发送 rpc 请求
    const client = new RpcClient({ logger, registry });
    const interfaceNames = options.interfaceNames || [];
    const rpcConsumers = {};
    for (let i = 0; i < interfaceNames.length; i++) {
      const interfaceName = interfaceNames[i];
      //使用 RpcClient 的 createConsumer 方法创建 rpc 消费者
      const consumer = client.createConsumer({
        interfaceName,
      });
      //等待 rpc 消费者准备完毕
      await consumer.ready();
      rpcConsumers[interfaceName.split(".").pop()] = consumer;
    }
    ctx.rpcConsumers = rpcConsumers;
    await next();
  };
};
module.exports = rpcMiddleware;
