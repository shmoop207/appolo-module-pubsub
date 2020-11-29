import {App} from '@appolo/core';

import {RedisModule} from '@appolo/redis';
import {LoggerModule} from '@appolo/logger';
import {IEnv} from "../env/IEnv";
import {IOptions} from "../../src/IOptions";


export = async function (app: App, env: IEnv, moduleOptions: IOptions) {

    if (!app.injector.getInstance("logger")) {
        await app.module.load(LoggerModule)
    }

    app.module.use(RedisModule.for({
        id: 'redisSub',
        connection: moduleOptions.connection,
    }), RedisModule.for({
        id: 'redisPub',
        connection: moduleOptions.connection,
    }));


}
