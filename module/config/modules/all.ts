import {App} from 'appolo';

import {RedisModule} from '@appolo/redis';
import {LoggerModule} from '@appolo/logger';
import {IEnv} from "../env/IEnv";
import {IOptions} from "../../src/IOptions";


export = async function (app: App, env: IEnv, moduleOptions: IOptions) {

    if(!app.injector.getInstance("logger")){
        await app.module(LoggerModule)
    }

    await app.module(new RedisModule({
        id: 'redisSub',
        connection: moduleOptions.connection,
    }));

    await app.module(new RedisModule({
        id: 'redisPub',
        connection: moduleOptions.connection,
    }));

}
