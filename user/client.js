const {
    client: { RpcClient },
    registry: { ZookeeperRegistry },
  } = require("sofa-rpc-node");
  // 设置日志记录器
  const logger = console;
  // 创建 Zookeeper 注册中心
  const registry = new ZookeeperRegistry({
    logger,
    address: "127.0.0.1:2181",
  });
  (async function () {
    // 创建 RPC 客户端
    const client = new RpcClient({ logger, registry });
    // 创建 RPC 服务消费者
    const userConsumer = client.createConsumer({
      // 指定服务接口名称
      interfaceName: "com.james.user",
    });
    // 等待服务就绪
    await userConsumer.ready();
    // 调用服务方法
    const result = await userConsumer.invoke("getUserInfo", [1], {
      responseTimeout: 3000,
    });
    // 输出结果
    console.log(result);
    process.exit(0);
  })();