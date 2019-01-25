"use strict";
import {define, inject, singleton} from 'appolo'
import {RedisProvider} from '@appolo/redis';
import {HandlersManager} from "./handlersManager";

@define()
@singleton()
export class PubSubProvider {

    @inject() protected redisPub: RedisProvider;
    @inject() protected handlersManager: HandlersManager;
    private _isInitialized = false;

    public async initialize(): Promise<void> {

        if (this._isInitialized) {
            return
        }

        await this.handlersManager.initialize();

        this._isInitialized = true;
    }

    public async publish(channel: string, message: any): Promise<void> {

        await this.redisPub.redis.publish(channel, JSON.stringify(message))
    }


}
