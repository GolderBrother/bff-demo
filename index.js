const Koa = require("koa");
const router = require("koa-router")();
const logger = require("koa-logger");
const rpcMiddleware = require("./middleware/rpc");
const cacheMiddleware = require("./middleware/cache");
const mqMiddleware = require('./middleware/mq');
const app = new Koa();
app.use(logger());
app.use(
  rpcMiddleware({
    //配置 rpc 中间件的参数，表示要调用的 rpc 接口名称
    interfaceNames: ["com.james.user", "com.james.post"],
  })
);
app.use(cacheMiddleware({}));
app.use(mqMiddleware({ url: "amqp://localhost:5672" }));
router.get("/", async (ctx) => {
  const userId = ctx.query.userId;
  ctx.channels.logger.sendToQueue(
    "logger",
    Buffer.from(
      JSON.stringify({
        method: ctx.method,
        path: ctx.path,
        userId,
      })
    )
  );
  const {
    rpcConsumers: { user, post },
  } = ctx;
  const cacheKey = `${ctx.method}#${ctx.path}#${userId}`;
  let cacheData = await ctx.cache.get(cacheKey);
  if (cacheData) {
    ctx.body = cacheData;
    return;
  }
  const [userInfo, postCount] = await Promise.all([
    user.invoke("getUserInfo", [userId]),
    post.invoke("getPostCount", [userId]),
  ]);
  // 裁剪数据
  delete userInfo.password;
  // 数据脱敏
  userInfo.phone = userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  // 数据适配
  userInfo.avatar = `https://p3-passport.byteacctimg.com/img/user-avatar/423647b4ff43e3a91a5ad4674a91f0e2~170x170.awebp`;
  cacheData = { userInfo, postCount };
  await ctx.cache.set(cacheKey, cacheData); // keys *
  ctx.body = cacheData;
});
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => {
  console.log("bff server is running at 3000");
});
