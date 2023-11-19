# 后端萌新学习实践 BFF

> 对于前端开发人员，采用**微服务**理念对 BFF 层实现（提高前端同学在业务中的话语权 😄 和便于前端交互功能实现的数据整合）

> 文章内容有点长，前面的实践操作有点多，建议慢慢动手操作实践下～

## 1.目录大纲

- BFF 架构演进
- 创建用户微服务
- 创建文章微服务
- 创建 BFF 入口服务
- 缓存
- 消息队列
- Serverless
- GraphQL
<!-- - RPC 高性性能 BFF 实战
- DDD 和 GraphQL 实战 BFF
- Serverless 实战 BFF -->

## 2.BFF 架构演进

### 2.1 单体服务

- 单体服务是指一个独立的应用程序，包含了所有的功能和业务逻辑。这种架构方式在小型应用程序中很常见
- 随着应用程序的功能越来越多，代码库也会越来越大，维护起来也会变得更加困难。此外，单体服务的整体复杂度也会增加，这可能导致软件开发周期变长，质量下降，并且系统的扩展性也会受到限制

![img](./imgs/web0_1673109441373.jpeg)

### 2.2 微服务

- 为了应对这些问题，许多公司开始使用**微服务**架构。微服务是指将一个大型应用程序拆分成若干个小型服务，**每个服务负责执行特定的任务**。这种架构方式可以帮助公司更快地开发和部署新功能，并提高系统的**可扩展性**和**可维护性**
- 这种方式会有以下问题
  - 域名开销增加
    - 内部服务器暴露在公网，有**安全隐患**
    - 各个端有大量的个性化需求
      - **数据聚合** 某些功能可能需要调用多个微服务进行组合
        - **数据裁剪** 后端服务返回的数据可能需要过滤掉一些敏感数据
        - **数据适配** 后端返回的数据可能需要针对不同端进行数据结构的适配，后端返回`XML`，但前端需要`JSON`
        - **数据鉴权** 不同的客户端有不同的权限要求

![img](./imgs/web15_1673110992237.jpeg)

### 2.3 BFF

- BFF 是`Backend for Frontend`的缩写，指的是专门**为前端应用设计的后端服务**
- 主要用来为各个端提供代理**数据聚合、裁剪、适配和鉴权**服务，方便各个端接入后端服务
- BFF 可以把前端和微服务进行解耦，各自可以独立演进
- BFF 层 其实理解成**一个功能单一的网关**

![img](./imgs/web23_1673111569390.jpeg)

### 2.4 网关

- API 网关是一种用于在应用程序和 API 之间提供**安全访问的中间层**
- API 网关还可以用于**监控 API 调用，路由请求**，以及在请求和响应之间添加附加功能（例如**身份验证，缓存，数据转换，压缩、流量控制、限流熔断、防爬虫**等）
- 网关和 BFF 可能合二为一

![img](./imgs/web32_1673150436062.jpeg)

### 2.5 集群化

- 单点服务器可能会存在以下几个问题：
  - 单点故障：单点服务器只有一台，如果这台服务器出现故障，整个系统都会停止工作，这会导致服务中断
  - 计算能力有限：单点服务器的计算能力是有限的，无法应对大规模的计算需求
  - 可扩展性差：单点服务器的扩展能力有限，如果想要提升计算能力，就必须改造或者替换现有的服务器
- 这些问题可以通过采用服务器集群的方式来解决

![img](./imgs/web4_1673152233154.jpeg)

## 3.创建用户微服务

### 3.1 微服务

- 微服务是一种架构模式，它将单个应用程序划分为小的服务，每个服务都独立运行并且可以使用不同的语言开发。这种架构模式使得应用程序变得更容易开发、维护和扩展
- 微服务架构通常会有许多不同的服务，这些服务可能位于不同的机器上，因此需要使用某种通信协议来进行通信
- 因为`RPC`协议比`HTTP`协议具有**更低的延迟**和**更高的性能**，所以用的更多

### 3.2 RPC

- `RPC（Remote Procedure Call）` 是远程过程调用的缩写，是一种通信协议，允许**程序在不同的计算机上相互调用远程**过程，就像调用本地过程一样
- `BFF`给前端提供`http`，BFF 调用后端的`RPC`

### 3.3 sofa-rpc-node

- `sofa-rpc-node` 是基于 Node.js 的一个 RPC 框架，支持多种协议

### 3.4 Protocol Buffers

- `Protocol Buffers`（简称 **protobuf**）是 Google 开发的一种**数据序列化格式**，可以将**结构化数据序列化成二进制格式**，并能够跨语言使用

### 3.5 Zookeeper

#### 3.5.1 简介

- `ZooKeeper` 是一个**分布式协调服务**，提供了一些简单的分布式服务，如配置维护、名字服务、组服务等。它可以用于管理分布式系统中的数据
- [Apache Zookeeper 官网](https://zookeeper.apache.org/releases.html)

#### 3.5.2 使用 docker 来安装启动 Zookeeper

通过 [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/) 搜索 `Zookeeper` 的镜像。

![](/bff/imgs/bff-demo/docker-zookeeper-image.png)

点击 Run，需要先将镜像pull下来，此时需要点时间～

![](/bff/imgs/bff-demo/docker-rabbitmq-image2.png)

pull完成，点击 `Run`，进行启动参数的配置：

![](/bff/imgs/bff-demo/docker-zookeeper-image2.png)

映射容器内的 `2181` 端口到本地的 `2181` 端口。

此处的端口 `2181` 是客户端用于连接 `Zookeeper` 服务端的端口。

（其他端口暂时用不到，可以先不管）

指定数据卷（volume），将本地目录挂载到容器的 `/var/lib/zookeeper` 目录，这个目录是 `Zookeeper` 用于存储数据的位置。

（此处的 `/Users/xxx/zookeeper` 是我本地的一个目录，你可以使用任意目录。在 `Windows` 系统下，路径形式为 `D://xxx/xx`）

然后点击 `Run`，这样，`Zookeeper` 容器便成功启动，`Zookeeper` 后台服务也顺利运行。

![](/bff/imgs/bff-demo/docker-zookeeper-container.png)

### 3.6 Mysql

#### 3.6.1 使用 docker 来安装启动 Mysql

`MySQL` 可以分为后台服务进程和客户端两个部分。

我们通常在命令行客户端或者图形化用户界面（GUI）客户端中连接 `MySQL`，通过发送 `SQL` 语句来操作数据库。

可以通过 [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/) 搜索 `MySQL` 的镜像。

![](/bff/imgs/bff-demo/docker-mysql-image.png)

点击运行，并输入参数：

![](/bff/imgs/bff-demo/docker-mysql-image2.png)

此处的端口 `3306` 是客户端用于连接 `MySQL` 的端口。

（另一个端口 `33060` 是 `MySQL` 8 新增的管理 `MySQL` 服务器的端口，本示例中不需要使用，先不用管）

指定数据卷（volume），将本地目录挂载到容器的 `/var/lib/mysql` 目录，这个目录是 `MySQL` 用于存储数据的位置。

（此处的 `/Users/xxx/mysql` 是我本地的一个目录，你可以使用任意目录。在 `Windows` 系统下，路径形式为 `D://xxx/xx`）

此外，还需要指定 `MYSQL_ROOT_PASSWORD`，也就是客户端连接 `MySQL` 服务器时所需的密码。

<!-- 如果不填写此项，容器启动时会出现如下提示：

意思是必须指定这三个环境变量中的一个。 -->

然后点击 `Run`，这样，`MySQL` 后台服务就启动成功了。

![](/bff/imgs/bff-demo/docker-mysql-container.png)

MySQL 镜像中包含了 MySQL 命令行工具，我们首先使用这个工具连接到 MySQL 服务器进行操作：

输入 mysql -u root -p，随后系统会提示你输入密码，输入正确密码后即可进入 MySQL 操作界面了

现在就可以通过 SQL 语句操作数据库。

然而，在学习 SQL 之前，还是建议从图形化用户界面（GUI）客户端开始学习。

市面上有许多 GUI 客户端可供选择，这里我们使用 MySQL 官方的 GUI 客户端：MySQL Workbench。

根据你的操作系统版本和 CPU 架构选择相应的安装包，对于 Intel 芯片请选择 x86 包，而 M1 芯片请选择 ARM 包，然后点击下载：

接下来以 M1 芯片对应的 ARM 包为例进行演示：

![](/bff/imgs/bff-demo/docker-mysql-workbench-download.png)

系统会提示你登录，可以点击下方的 "no thanks"，直接开始下载：

![](/bff/imgs/bff-demo/docker-mysql-workbench-download2.png)

下载安装包后，双击进行安装。

安装完成后，打开 MySQL Workbench，点击这个加号（+）图标：

![](/bff/imgs/bff-demo/docker-mysql-workbench.png)

输入连接名称 `bff-mysql-connection`，点击 "store in keychain" 并输入密码：

![](/bff/imgs/bff-demo/docker-mysql-workbench2.png)

![](/bff/imgs/bff-demo/docker-mysql-workbench3.png)

接下来，可以点击 `Test Connection` 测试连接是否成功：

![](/bff/imgs/bff-demo/docker-mysql-workbench4.png)

点击第一个图标，创建一个名为 `bff-mysql` 的数据库（也称为 schema）

![](/bff/imgs/bff-demo/docker-mysql-workbench-create-database.png)

输入名称，指定字符集，然后点击右下角的 "apply"。

创建成功之后，就可以看到我们刚建的数据库：

![](/bff/imgs/bff-demo/docker-mysql-workbench-create-database2.png)

润色：

#### 3.6.2 使用 workbench 来创建表

选中 `bff-mysql` 的数据库，点击创建 `table` 的按钮，我们来建两张表：

![](/bff/imgs/bff-demo/docker-mysql-workbench-create-table.png)

##### 3.6.2.1 创建user表：

输入表名 `user`。

首先创建 id 列：

填写描述，选中 primary key 和 auto increment 约束。

primary key 是主键（primary key），用于区分每一行数据的唯一标识，通常命名为 id。

primary key 自带了唯一（unique）和非空（not null）的约束。

勾选 auto increment 选项，这样在插入数据时，id 会自动递增，例如 1、2、3、4 等。

接下来，依次创建 username、avatar、password、phone、create_time、update_time 列：

![](/bff/imgs/bff-demo/docker-mysql-workbench-table-user.png)


然后点击右下角的 apply，就会生成建表 sql：

![](/bff/imgs/bff-demo/docker-mysql-workbench-table-user2.png)

```sql
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `username` varchar(45) NOT NULL COMMENT '用户名',
  `avatar` varchar(45) DEFAULT NULL COMMENT '头像',
  `password` varchar(45) NOT NULL COMMENT '密码',
  `phone` varchar(18) NOT NULL COMMENT '手机号',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

创建成功之后点击第三个图标，就可以查询这个表的所有数据：

![](/bff/imgs/bff-demo/docker-mysql-workbench-table-user3.png)

你可以新增几行数据，每一行数据叫做一个记录（Record）。

可以在下面直接编辑，然后点击 apply：

（这里不用设置 id，因为我们指定了它自增了，会自动设置）

![](/bff/imgs/bff-demo/docker-mysql-workbench-table-user-insert.png)

##### 3.6.2.2 创建post表：

创建 post 表跟上面创建 user 表是一样的，这里就不多赘述了

只不过需要在创建字段的时候，需要创建一个**外键**`user_id`来关联 user 表

![](/bff/imgs/bff-demo/docker-mysql-workbench-table-post-foreign-key.png)

指定外键 `user_id` 关联 `user` 表的 `id`。

这里还要选择主表数据 `update` 或者 `delete` 的时候，我们先用默认的，从表不做任何操作。

然后点击 apply，生成最后的建表 sql如下，可以直接执行 sql 语句来创建表

```sql
CREATE TABLE `post` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID主键，INT 类型，整数，作为主键并自动递增',
  `title` varchar(45) NOT NULL COMMENT '文章标题',
  `description` text COMMENT '文章描述',
  `content` longtext NOT NULL COMMENT '文章内容',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 3.7 创建微服务项目

- `logger` 是日志记录器，用于记录服务器运行时的日志信息，类似腾讯云的[CLS 日志服务](https://cloud.tencent.com/product/cls)
- `registry` 是一个注册中心，用于维护服务的注册信息，帮助服务节点和客户端找到对方，类似[etcd](https://etcd.io/)。
- `server` 表示服务端。服务端是提供服务的节点，它会将自己所提供的服务注册到注册中心，并等待客户端的调用。服务端通常会实现具体的业务逻辑，并使用 `RPC` 或其他通信协议与客户端进行通信
- `server` 的 `addService` 方法接受两个参数：**服务接口和服务实现**。服务接口是一个对象，其中包含了服务的名称信息。服务实现是一个对象，其中包含了具体实现服务方法的函数
- RPC 服务器的 `start` 方法，用于**启动服务器**
- RPC 服务器的 `publish` 方法，用于向注册中心**注册服务**。这样，客户端就可以**通过注册中心获取服务的地址和端口**，并直接向服务器发起调用

#### 3.7.1 初始化用户微服务项目

```bash
mkdir bff-demo
cd bff-demo
mkdir user
cd user
npm init -y
```

#### 3.7.2 安装依赖

```bash
npm install mysql2 sofa-rpc-node --save
```

#### 3.7.3 使用 `nodemon` 启动服务

user/package.json

将原本的 test 脚本删掉，增加一个启动服务的 npm 脚本：

```diff
{
  "name": "user",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
+ "scripts": {
+     "dev": "nodemon index.js"
+ },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "mysql2": "^3.6.3",
    "sofa-rpc-node": "^2.10.0"
  }
}
```

#### 3.7.4 用户服务入口

> user/index.js

```js
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
  port: 10000,
});
// 添加服务接口，实现 getUserInfo 方法
server.addService(
  {
    interfaceName: "com.james.user",
  },
  {
    async getUserInfo(userId) {
      const [rows] = await connection.execute(
        `SELECT id,username,avatar,password,phone FROM user WHERE id=${userId} limit 1`
      );
      return rows[0];
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
  // 启动服务器
  await server.start();
  // 注册服务
  await server.publish();
  console.log(`用户微服务发布成功`);
})();
```

#### 3.7.5 客户端服务调用

> user/client.js

```js
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
```

## 4.创建文章微服务

### 4.1 初始化文章微服务项目

```bash
mkdir article
cd article
npm init -y
```

### 4.2 安装

```bash
npm install mysql2 sofa-rpc-node --save
```

### 4.3 增加启动服务命令

> article/package.json

```diff
{
  "name": "article",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
+    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "mysql2": "^3.6.3",
    "sofa-rpc-node": "^2.10.0"
  }
}

```

### 4.4 文章服务入口

> article/index.js

```js
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
```

### 4.5 调用服务

再加个调用服务的入口

> article/client.js

```js
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
  const consumer = client.createConsumer({
    // 指定服务接口名称
    interfaceName: "com.james.post",
  });
  // 等待服务就绪
  await consumer.ready();
  // 调用服务方法
  const result = await consumer.invoke("getPostCount", [1], {
    responseTimeout: 3000,
  });
  // 输出结果
  console.log(result);
  process.exit(0);
})();
```

## 5.创建 BFF 入口服务

我们在根目录下创建个主服务，用来调用各个微服务

### 5.1 安装

```bash
npm init -y
npm install koa koa-router koa-logger sofa-rpc-node lru-cache ioredis amqplib fs-extra --save
```

### 5.2 bff 入口

加个 bff 的入口程序：

> bff/index.js

```js
const Koa = require("koa");
const router = require("koa-router")();
const logger = require("koa-logger");
const app = new Koa();
app.use(logger());
router.get("/", async (ctx) => {
  const userId = ctx.query.userId;
  ctx.body = { userId };
});
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => {
  console.log("bff server is running at 3000");
});
```

### 5.3 使用 nodemon 启动

安装 nodemon:

```
npm i nodemon --save
```

然后增加个启动脚本

> bff/package.json

```diff
{
  "name": "bff-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
+    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "amqplib": "^0.10.3",
    "fs-extra": "^11.1.1",
    "ioredis": "^5.3.2",
    "koa": "^2.14.2",
    "koa-logger": "^3.2.1",
    "koa-router": "^12.0.1",
    "lru-cache": "^10.0.2",
+   "nodemon": "^3.0.1",
    "sofa-rpc-node": "^2.10.0"
  }
}

```

我们启动下看看:

```bash
npm run dev
```

访问地址[http://localhost:3000/?userId=1](http://localhost:3000/?userId=1)

![](./imgs/bff-demo/bff1.png)

看下日志，没啥问题：

![](./imgs/bff-demo/bff2.png)

### 5.4 rpc 服务

我们再创建个 rpc 服务中间件，等会儿用来调用微服务

> bff/middleware/rpc.js

```js
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
```

### 5.5 增加 rpc 中间件

我们来改下入口文件：

> bff/index.js

```diff
const Koa = require("koa");
const router = require("koa-router")();
const logger = require("koa-logger");
const rpcMiddleware = require("./middleware/rpc");
const app = new Koa();
app.use(logger());
app.use(
  rpcMiddleware({
    //配置 rpc 中间件的参数，表示要调用的 rpc 接口名称
    interfaceNames: ["com.james.user", "com.james.post"],
  })
);
router.get("/", async (ctx) => {
  const userId = ctx.query.userId;
  const {
    rpcConsumers: { user, post },
  } = ctx;
  const [userInfo, postCount] = await Promise.all([
    user.invoke("getUserInfo", [userId]),
    post.invoke("getPostCount", [userId]),
  ]);
  ctx.body = { userInfo, postCount };
});
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => {
  console.log("bff server is running at 3000");
});
```

### 5.6 数据处理

增加数据处理部分，包括：

- 裁剪数据
- 数据脱敏
- 数据适配

> bff/index.js

```diff
const Koa = require("koa");
const router = require("koa-router")();
const logger = require("koa-logger");
const rpcMiddleware = require("./middleware/rpc");
const app = new Koa();
app.use(logger());
app.use(
  rpcMiddleware({
    //配置 rpc 中间件的参数，表示要调用的 rpc 接口名称
    interfaceNames: ["com.james.user", "com.james.post"],
  })
);
router.get("/", async (ctx) => {
  const userId = ctx.query.userId;
  const {
    rpcConsumers: { user, post },
  } = ctx;
  const [userInfo, postCount] = await Promise.all([
    user.invoke("getUserInfo", [userId]),
    post.invoke("getPostCount", [userId]),
  ]);
+ // 裁剪数据
+ delete userInfo.password;
+ // 数据脱敏
+ userInfo.phone = userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
+ // 数据适配
+ userInfo.avatar = `https://p3-passport.byteacctimg.com/img/user-avatar/423647b4ff43e3a91a5ad4674a91f0e2~170x170.awebp`;
  ctx.body = { userInfo, postCount };
});
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => {
  console.log("bff server is running at 3000");
});

```

我们把`user`微服务和`article`微服务也启动下，看看主服务调用微服务是否能通

启动`user`微服务：

```bash
cd ./user
npm run dev
```

再启动 article 微服务：

```bash
cd ./article
npm run dev
```

看看效果：

## 6.缓存

- **BFF** 作为前端应用和后端系统之间的**抽象层**，承担了大量的**请求转发**和**数据转换**工作。使用**多级缓存**可以帮助 BFF 减少对后端系统的访问，从而提高应用的响应速度

- 当 BFF 收到一个请求时，首先会检查**内存缓存**中是否存在对应的数据，如果有就直接返回数据。如果内存缓存中没有数据，就会检查**Redis 缓存**，如果 **Redis 缓存**中有数据就返回数据，并将数据写入内存缓存。如果 `Redis` 本地缓存中也没有数据，那么就会向后端系统发起请求，并将数据写入 **Redis 缓存**和内存缓存

  **内存缓存 -> Redis 缓存 -> 将数据写入内存缓存 -> 后端系统发起请求**

### 6.1 多级缓存

- 多级缓存（`multi-level cache`）是指系统中使用了多个缓存层来存储数据的技术。这些缓存层的**优先级通常是依次递减**的，即最快的缓存层位于最顶层，最慢的缓存层位于最底层

### 6.2 LRU

- LRU（Least Recently Used）是一种常用的**高速缓存淘汰算法**，它的原理是将**最近使用过的数据**或页面保留在缓存中，而**最少使用的数据或页面将被淘汰**。这样做的目的是为了最大化缓存的命中率，也就是使用缓存尽可能多地满足用户的请求

### 6.3 redis

- `Redis` 是一种开源的**内存数据存储系统**，可以作为**数据库、缓存和消息中间件**使用
- `Redis` 运行在**内存**中，因此它的**读写速度非常快**
- `ioredis` 是一个基于 Node.js 的 `Redis` 客户端，提供了对 `Redis` 命令的高度封装和支持
- [redis](https://github.com/tporadowski/redis/releases)
- [Redis-x64-5.0.14.1](https://sourceforge.net/projects/redis-for-windows.mirror/files/v5.0.14.1/Redis-x64-5.0.14.1.zip/download)

### 6.3.1 使用docker跑redis

通过 [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/) 搜索 `Redis` 镜像，点击 `Run`，将镜像下载下来并运行起来。

![](/bff/imgs/bff-demo/docker-redis-image.png)

![](/bff/imgs/bff-demo/docker-redis-image2.png)

镜像下载完成后，填写运行容器所需的信息：

![](/bff/imgs/bff-demo/docker-redis-container.png)

端口映射的作用是将主机的 6379 端口映射到容器内的 6379 端口，这样我们就可以直接通过本机端口访问容器内的 `Redis` 服务。

指定数据卷，将本机的任意一个目录挂载到容器内的 /data 目录，这样 `Redis` 数据就会保存在本机。

运行成功后，界面是这样的：

![](/bff/imgs/bff-demo/docker-redis-container2.png)

容器内打印的日志表明 `Redis` 服务跑起来了。

### 6.4 使用缓存

#### 6.4.1 新增缓存中间件

> bff/index.js

```diff
const Koa = require('koa');
const router = require('koa-router')();
const logger = require('koa-logger');
const rpcMiddleware = require('./middleware/rpc');
+const cacheMiddleware = require('./middleware/cache');
const app = new Koa();
app.use(logger());
app.use(rpcMiddleware({
    interfaceNames: [
        'com.james.user',
        'com.james.post'
    ]
}));
+app.use(cacheMiddleware({}));
router.get('/profile', async ctx => {
    const userId = ctx.query.userId;
    const { rpcConsumers: { user, post } } = ctx;
+ const cacheKey = `${ctx.method}#${ctx.path}#${userId}`;
+ let cacheData = await ctx.cache.get(cacheKey);
+ if (cacheData) {
+     ctx.body = cacheData;
+     return;
+ }
    const [userInfo, postCount] = await Promise.all([
        user.invoke('getUserInfo', [userId]),
        post.invoke('getPostCount', [userId])
    ]);
  // 裁剪数据
  delete userInfo.password;
  // 数据脱敏
  userInfo.phone = userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  // 数据适配
  userInfo.avatar = `http://rhrc.woa.com/photo/150/${userInfo.avatar}.png`;
+ cacheData = { userInfo, postCount };
+ await ctx.cache.set(cacheKey, cacheData);// keys *
+ ctx.body = cacheData
});
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => {
    console.log('bff server is running at 3000');
});
```

#### 6.4.2 cache 实现

> bff/middleware/cache.js

```js
const { LRUCache } = require('lru-cache')
const Redis = require("ioredis");
// 缓存
class CacheStore {
  constructor() {
    this.stores = [];
  }
  add(store) {
    this.stores.push(store);
    return this;
  }
  async get(key) {
    for (const store of this.stores) {
      const value = await store.get(key);
      if (value !== undefined) {
        return value;
      }
    }
  }
  async set(key, value) {
    for (const store of this.stores) {
      await store.set(key, value);
    }
  }
}
// 内存
class MemoryStore {
  constructor() {
    this.cache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60 * 24,
    });
  }
  async get(key) {
    return this.cache.get(key);
  }
  async set(key, value) {
    this.cache.set(key, value);
  }
}
// redis缓存
class RedisStore {
  constructor(options) {
    this.client = new Redis(options);
  }
  async get(key) {
    let value = await this.client.get(key);
    return value ? JSON.parse(value) : undefined;
  }
  async set(key, value) {
    await this.client.set(key, JSON.stringify(value));
  }
}
const cacheMiddleware = (options = {}) => {
  return async function (ctx, next) {
    const cacheStore = new CacheStore();
    cacheStore.add(new MemoryStore());
    const redisStore = new RedisStore(options);
    cacheStore.add(redisStore);
    ctx.cache = cacheStore;
    await next();
  };
};
module.exports = cacheMiddleware;
```

## 7.消息队列

- 消息队列（Message Queue）用于在分布式系统中传递数据。它的特点是可以将**消息发送者和接收者解耦**，使得消息生产者和消息消费者可以独立的开发和部署

### 7.1 引入原因

- 在 BFF 中使用消息队列（message queue）有几个原因：
  - **大并发**：消息队列可以帮助应对大并发的请求，BFF 可以将请求写入消息队列，然后后端服务可以从消息队列中读取请求并处理
  - **解耦**：消息队列可以帮助解耦 BFF 和后端服务，BFF 不需要关心后端服务的具体实现，只需要将请求写入消息队列，后端服务负责从消息队列中读取请求并处理
  - **流量削峰**：消息队列可以帮助流量削峰，BFF 可以将请求写入消息队列，然后后端服务可以在合适的时候处理请求，从而缓解瞬时高峰流量带来的压力

### 7.2 RabbitMQ

- `RabbitMQ`是一个消息队列，它可以用来在消息生产者和消息消费者之间传递消息
- **RabbitMQ**的工作流程如下：
  - 消息生产者将消息发送到`RabbitMQ`服务器
  - `RabbitMQ`服务器将消息保存到队列中
  - 消息消费者从队列中读取消息
  - 当消息消费者处理完消息后`RabbitMQ`服务器将消息删除
- 安装启动
  - 在 RabbitMQ 下载[官网安装包](https://www.rabbitmq.com/install-windows.html#installer)
  - 双击安装包，按照提示进行安装,直接就可以启动
    - 安装前还要安装[Erlang](https://www.erlang.org/downloads),Erlang 是一个结构化，动态类型编程语言，内建并行计算支持


还是使用 docker 来安装和启动 mq

https://juejin.cn/book/7226988578700525605/section/7236156565277900858?enter_from=course_center&utm_source=course_center

我们通过 docker 来跑 RabbitMQ。

搜索 `rabbitmq` 的镜像，选择 `3.12-management` 的版本：

![](/bff/imgs/bff-demo/docker-rabbitmq-image.png)

这个版本是有 web 管理界面的。

然后点击 Run，需要先将镜像pull下来，此时需要点时间～

![](/bff/imgs/bff-demo/docker-rabbitmq-image2.png)

pull完成了，进行启动参数的配置：

![](/bff/imgs/bff-demo/docker-rabbitmq-container.png)

映射容器内的 5672、15672 这俩端口到本地的端口。

这里的 15672 是管理界面的，5672 是 mq 服务的端口。

再点击 `Run`，等 `rabbitmq` 跑起来之后：

![](/bff/imgs/bff-demo/docker-rabbitmq-container2.png)

就可以在浏览器访问 [http://localhost:15672](http://localhost:15672) 了：

![](/bff/imgs/bff-demo/docker-rabbitmq-admin.png)

然后输入 guest、guest 进入管理页面，可以看到 connection、channel、exchange、queue 的分别的管理页面：

![](/bff/imgs/bff-demo/docker-rabbitmq-admin2.png)

这就是它的 web端的管理界面。说明 `rabbitmq` 服务已经启动成功了～

### 7.3 实现

#### 7.3.1 mq 消息队列实现

> bff/index.js

```diff
const Koa = require('koa');
const router = require('koa-router')();
const logger = require('koa-logger');
const rpcMiddleware = require('./middleware/rpc');
const cacheMiddleware = require('./middleware/cache');
+const mqMiddleware = require('./middleware/mq');
const app = new Koa();
app.use(logger());
app.use(rpcMiddleware({
    interfaceNames: [
        'com.james.user',
        'com.james.post'
    ]
}));
app.use(cacheMiddleware({}));
+app.use(mqMiddleware({ url: 'amqp://localhost:5672' }));
router.get('/profile', async ctx => {
    const userId = ctx.query.userId;
+    ctx.channels.logger.sendToQueue('logger', Buffer.from(JSON.stringify({
+        method: ctx.method,
+        path: ctx.path,
+        userId
+    })));
    const { rpcConsumers: { user, post } } = ctx;
    const cacheKey = `${ctx.method}#${ctx.path}#${userId}`;
    let cacheData = await ctx.cache.get(cacheKey);
    if (cacheData) {
        ctx.body = cacheData;
        return;
    }
    const [userInfo, postCount] = await Promise.all([
        user.invoke('getUserInfo', [userId]),
        post.invoke('getPostCount', [userId])
    ]);
      // 裁剪数据
  delete userInfo.password;
  // 数据脱敏
  userInfo.phone = userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  // 数据适配
  userInfo.avatar = `http://rhrc.woa.com/photo/150/${userInfo.avatar}.png`,
    cacheData = { userInfo, postCount };
  await ctx.cache.set(cacheKey, cacheData);// keys *
  ctx.body = cacheData
});
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => {
    console.log('bff server is running at 3000');
});
```

#### 7.3.2 mq 中间件

> bff/middleware/mq.js

```js
const amqp = require("amqplib");
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
    ctx.channels = {
      logger,
    };
    await next();
  };
};
module.exports = mqMiddleware;
```

在rabbitmq管理界面可以看到刚创建的[`channel`](http://localhost:15672/#/queues)

![](/bff/imgs/bff-demo/rabbitmq-admin-channel.png)


#### 7.3.3 日志处理

在 `mq` 中采集下日志进行处理和存储，我们来改造下mq中间件，加个消费读端`logger`来采集日志

> bff/logger.js

```js
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
```

### 7.4 启动所有服务联调

#### 7.4.1 启动所有主服务和微服务

我们来下启动所有服务，看下效果：

- 启动主服务

```bash
npm run dev
```

![](/bff/imgs/bff-demo/main-service-start.png)

- 启动article微服务

```bash
npm run dev
```

![](/bff/imgs/bff-demo/micro-service-article.png)

- 启动user微服务

```bash
npm run dev
```

![](/bff/imgs/bff-demo/micro-service-user.png)

都启动成功了，没啥问题

再通过浏览器调用主服务，看下响应是否正常

#### 7.4.2 调用主服务路由

我们访问下主服务的路由看看

[http://localhost:3000/?userId=1](http://localhost:3000/?userId=1)

![](/bff/imgs/bff-demo/main-service-response-user1.png)

[http://localhost:3000/?userId=2](http://localhost:3000/?userId=2)

![](/bff/imgs/bff-demo/main-service-response-user2.png)

返回的数据也是正常的，对比下mysql中的数据，也是对的上的

![](/bff/imgs/bff-demo/main-service-response-user3.png)


再来看看服务打印的日志也写到`logger.txt`文件了，当然这里也可以写到[腾讯云日志服务cls](https://cloud.tencent.com/product/cls)中

![](/bff/imgs/bff-demo/bff-rabbitmq-logger.png)

## 8.Serverless

### 8.1 BFF 问题

- **复杂性增加**：添加 `BFF` 层会增加系统的复杂性，因为它需要在**后端 API 和前端应用程序之间处理请求和响应**
- **重复开发**：每个设备都要开发一个 `BFF` 应用，也会面临一些重复开发的问题展示，**增加开发成本**
- **性能问题**：如果 `BFF` 层的实现不当，可能会导致性能问题，因为它需要在**后端 API 和前端应用程序之间传输大量数据**
- **安全风险**：如果 `BFF` 层未得到正确保护，可能会导致安全风险，因为它可能会暴露敏感数据
- **链路复杂**：流程变得繁琐，`BFF` 引入后，要同时走前端、服务端的研发流程，多端发布、互相依赖，导致流程繁琐
- **测试复杂性**：由于 `BFF` 层需要在后端 API 和前端应用程序之间进行测试，因此测试可能会变得更加复杂
- **运维问题**：要求有强大的日志、服务器监控、性能监控、负载均衡、备份容灾、监控报警和弹性伸缩扩容等
- **维护成本**：BFF 层需要维护和更新，这会增加维护成本

![img](./imgs/bff-1.png)

### 8.2 Serverless

- 这些问题可以通过[Serverless](https://docs.cloudbase.net/)来解决
- **Serverless = Faas (Function as a service) + Baas (Backend as a service)**
- FaaS（Function-as-a-Service）是服务商提供一个平台、提供给**用户开发、运行管理这些函数的功能**，而无需搭建和维护基础框架，是一种**事件驱动由消息触发的函数服务**
- BaaS（Backend-as-a-Service）**后端即服务**，包含了后端服务组件，它是基于 API 的第三方服务，用于实现应用程序中的核心功能，包含常用的**数据库、对象存储、消息队列、日志服务**等等

Serverless 的演变：
![img](./imgs/bff-demo/serverless1.png)

Serverless 的组成：
![img](./imgs/bff-demo/serverless2.png)

Serverless 的架构：
![img](./imgs/bff-demo/serverless3.png)

云函数（Faas）:

![img](./imgs/bff-5.png)

### 8.3 Serverless 的优势

- 节省成本：在传统架构中，你需要为应用程序所使用的服务器付费，即使它们没有被使用。在 `Serverless` 架构中，你仅需为**实际使用的资源付费**，这可以节省大量成本
- 更快的**开发周期**：`Serverless` 架构允许开发人员更快地构建和部署应用程序，因为它们可以更快地获得所需的资源
- 更好的**可伸缩性**：`Serverless` 架构可以**自动扩展**来满足增长的流量需求，无需人工干预
- 更好的**可维护性**：在 `Serverless` 架构中，你无需担心底层基础架构的维护，因为这些工作由云服务提供商负责
- 更高的**可用性**：由于 `Serverless` 架构具有**自动扩展**功能，因此它可以更好地应对突发流量，从而提高应用程序的可用性

![img](./imgs/bff-3.png)

### 8.4 Serverless 的缺点

- 复杂性：`Serverless` 架构可能会使应用程序的体系结构变得更加复杂，因为它需要**将应用程序拆分为许多小型函数**
- 性能问题：在某些情况下，`Serverless` 架构可能会导致性能问题，因为函数执行需要额外的时间来启动和终止
- 限制：每个函数都有资源限制，因此需要仔细规划应用程序的体系结构，以免超出这些限制
- 不适合长时间任务：云函数平台会限制函数执行时间，如阿里云 **Function Compute** 最大执行时长为 **10 min**
- 依赖云服务提供商：使用 `Serverless` 架构需要依赖云服务提供商，因此如果这些服务出现故障，可能会对应用程序造成影响
- 调试困难：由于 `Serverless` 架构使用许多小型函数，因此调试可能会变得更加困难

![img](./imgs/bff-4.png)

## 9.GraphQL

- `GraphQL`是一种用于 **API 的查询语言**，它允许客户端向服务端**请求特定的数据**，而不是服务端将所有可能的数据全部返回。这样，客户端可以更精确地获取所需的数据，并且服务端可以更有效地满足请求
- `GraphQL`可以让客户端**自己定义所需的数据结构，可以灵活地获取所需的数据**。这对于多端应用来说非常方便，因为每一个客户端可能有不同的数据需求，使用 GraphQL 可以让每个客户端自己定义所需的数据结构
- `GraphQL`可以让 BFF 服务层从不同的数据源获取数据，并将它们组合起来返回给客户端。这对于在 BFF 架构中更好地组织数据是很有帮助的，因为你可以在 BFF 层中组合来自不同数据源的数据，而不用在客户端中再做一次组合

### 9.1 Apollo Server

- `Apollo Server`是一个用于构建 `GraphQL API` 的开源服务器框架。它支持多种编程语言，允许你使用同一种方式来访问不同的后端数据源，并且具有良好的扩展性
- `Apollo Server`是一种实现 `GraphQL` 服务端的方法，它提供了一些工具和功能，帮助你更轻松地构建和部署 `GraphQL API`。它还提供了一些额外的功能，如缓存、身份验证和模拟数据，帮助你更快速地开发和测试你的 API

### 9.2 GraphQL schema language

- [schema](https://graphql.org/learn/schema/)
- `GraphQL schema language`是一种用来定义 `GraphQL API` 的语言。它可以用来描述 API 中可用的数据和操作，包括支持的查询、变更、订阅等功能
- `GraphQL schema`由一系列的类型组成，每种类型都有一个名称和一些字段。每个字段都有一个名称和类型，并可能有一些额外的限制，比如是否是必填的或者有默认值

### 9.3 resolvers

- [resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/)
- 在 GraphQL 中，`resolvers`是负责解析每个字段的函数。在 Apollo Server 中，你可以使用 resolvers 对象来定义这些函数
- `resolvers`对象是一个包含了所有解析器函数的对象。它的结构与你在 schema 中定义的类型的结构是一样的
- 除了定义解析器函数以外，你还可以在 `resolvers` 对象中定义自定义操作，例如查询、变更、订阅等。这些操作的解析器函数与字段的解析器函数的定义方式是一样的，只是函数名称不同而已

### 9.4 ApolloServer 示例

- `gql`函数是一个`template tag`，你可以将它放在模板字符串的前面，然后在模板字符串中编写 `GraphQL schema language` 的代码,可以定义查询和变更操作
- resolvers 函数参数
  - obj：表示当前查询的**父对象**。例如，如果你在查询"user"类型的对象，那么 obj 就表示当前查询的"user"对象
  - args：表示当前查询的**参数**。例如，如果你在查询带有参数的字段，那么 args 就表示这些参数
  - context：表示当前的**上下文对象**，可以在整个查询中传递给所有的 resolver
  - info：表示当前的**查询信息**，包括查询字符串、查询操作（query/mutation）、查询字段等

```js
const { ApolloServer, gql } = require('apollo-server');
const typeDefs = gql`
  type Query {
    users: [User]
    user(id: ID): User
  }
  type Mutation {
    createUser(username: String, age: Int): User
    updateUser(id: ID, username: String, age: Int): Boolean
    deleteUser(id: ID): Boolean
  }
  type User {
    id: ID
    username: String
    age: Int
  }
`;
let users = [
    { id: "1", username: "jamese", age: 27 },
    { id: "2", username: "zhangsan", age: 25 },
    { id: "3", username: "lisi", age: 30 },
];
const resolvers = {
    Query: {
        users: (obj, args, context, info) => {
            return users;
        },
        user: (obj, args, context, info) => {
            return users.find(user => user.id === args.id);
        }
    },
    Mutation: {
        createUser: (obj, args, context, info) => {
            const newUser = { id: users.length + 1, username: args.username, age: args.age };
            users.push(newUser);
            return newUser;
        },
        updateUser: (obj, args, context, info) => {
            const updatedUser = { id: args.id, username: args.username, age: args.age };
            users = users.map(user => {
                if (user.id === args.id) {
                    return updatedUser;
                }
                return user;
            });
            return true;
        },
        deleteUser: (obj, args, context, info) => {
            users = users.filter(user => user.id !== args.id);
            return true;
        },
    },
};
const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
query {
    users {
        id
        username
        age
    }
}
query {
    user(id: "1") {
        id
        username
        age
    }
}
mutation {
    createUser(username: "wangwu", age: 35) {
        id
        username
        age
    }
}
mutation {
    updateUser(id: "1", username: "jamesezhang", age: 28)
}
mutation {
    deleteUser(id: "1")
}
```

### 9.5 Apollo Server Koa

- [`Apollo Server Koa`](https://npmjs.com/package/apollo-server-koa) 是一个基于 `Koa` 的中间件，可以将 `GraphQL API` 添加到 `Koa` 应用程序中。它使用 `Apollo Server` 来执行 `GraphQL` 服务器逻辑，并允许使用 `Koa` 的优秀特性（如路由和中间件）来构建应用程序

```js
const Koa = require("koa");
const { ApolloServer } = require("apollo-server-koa");

const typeDefs = `
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello, world!",
  },
};

(async function () {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  const app = new Koa();
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
```

## 10.总结

[所有代码](https://github.com/GolderBrother/bff-demo)

> 本文偏向于微服务的案例实践，未来也可以采用 `Serverless` 理念对 `BFF` 层进行改造，使这一切成为了可能，零配置即可完成项目的发布上线

`serverless` 的更多基础知识在[`Serverless` 基础系列专栏](https://juejin.cn/column/7287620609373945912)沉淀，有兴趣深入学习的同学可以先了解下对应的系列文章：

## 参考

- [你学 BFF 和 Serverless 了吗](https://juejin.cn/post/6844904185427673095#heading-14)
