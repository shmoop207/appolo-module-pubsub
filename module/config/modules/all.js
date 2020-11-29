"use strict";
const redis_1 = require("@appolo/redis");
const logger_1 = require("@appolo/logger");
module.exports = async function (app, env, moduleOptions) {
    if (!app.injector.getInstance("logger")) {
        await app.module.load(logger_1.LoggerModule);
    }
    app.module.use(redis_1.RedisModule.for({
        id: 'redisSub',
        connection: moduleOptions.connection,
    }), redis_1.RedisModule.for({
        id: 'redisPub',
        connection: moduleOptions.connection,
    }));
};
//# sourceMappingURL=all.js.map