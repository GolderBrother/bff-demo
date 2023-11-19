const {
  server: { RpcServer },
  registry: { ZookeeperRegistry },
} = require("sofa-rpc-node");
const mysql = require("mysql2/promise");
let connection;
// 引入 console 模块
const logger = console;
// 创建 Zookeeper 注册中心实例，传入地址为 '127.0.0.1:2181'
const registry = new ZookeeperRegistry({
  logger,
  address: "127.0.0.1:2181",
  connectTimeout: 1000 * 60 * 60 * 24,
});
// 创建 RPC 服务器实例，传入注册中心和端口号
const server = new RpcServer({
  logger,
  registry,
  port: 20000,
});
// 添加服务接口，实现 getPostCount 方法
server.addService(
  {
    interfaceName: "com.james.post",
  },
  {
    async getPostCount(userId) {
      const [rows] = await connection.execute(
        `SELECT count(*) as postCount FROM post WHERE user_id=${userId} limit 1`
      );
      return rows[0].postCount;
    },
  }
);
// 启动 RPC 服务器，并发布服务
(async function () {
  connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bff-mysql",
  });
  await server.start();
  await server.publish();
  console.log(`文章微服务发布成功`);
})();
