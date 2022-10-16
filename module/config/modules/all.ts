import {App} from '@appolo/engine';
import * as path from 'path';

import {RedisModule} from '@appolo/redis';
import {LoggerModule} from '@appolo/logger';
import {IEnv} from "../env/IEnv";
import {IOptions} from "../../src/common/interfaces/IOptions";


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
        scripts: [{name: "publishRandomHost", args: 0,path:path.resolve(__dirname, "../../src/lua/publishRandomHost.lua")}]
    }));


}
