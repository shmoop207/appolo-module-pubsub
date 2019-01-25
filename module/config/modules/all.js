"use strict";
const redis_1 = require("@appolo/redis");
const logger_1 = require("@appolo/logger");
module.exports = async function (app, env, moduleOptions) {
    if (!app.injector.getInstance("logger")) {
        await app.module(logger_1.LoggerModule);
    }
    await app.module(new redis_1.RedisModule({
        id: 'redisSub',
        connection: moduleOptions.connection,
    }));
    await app.module(new redis_1.RedisModule({
        id: 'redisPub',
        connection: moduleOptions.connection,
    }));
};
//# sourceMappingURL=all.js.map