"use strict";
import {define, inject, singleton} from '@appolo/inject'
import {RedisProvider} from '@appolo/redis';
import {HandleFn, HandlersManager} from "../handlers/handlersManager";
import {Promises} from "@appolo/utils";
import {RequestReplyManager} from "../request/requestReplyManager";

@define()
@singleton()
export class PubSubProvider {

    @inject() protected redisPub: RedisProvider;
    @inject() protected handlersManager: HandlersManager;
    @inject() protected requestReplyManager: RequestReplyManager;
    private _isInitialized = false;

    public async initialize(): Promise<void> {

        if (this._isInitialized) {
            return
        }

        await this.handlersManager.initialize();
        await this.requestReplyManager.initialize();

        this._isInitialized = true;
    }

    public async publish(channel: string, data?: { [index: string]: any }): Promise<void> {

        await this.redisPub.redis.publish(channel, JSON.stringify(data || {}))
    }

    public async on(params: { channel: string, fn: HandleFn, scope: any }): Promise<void> {
        await this.handlersManager.subscribe(params)
    }

    public async un(params: { channel: string, fn: HandleFn, scope: any }): Promise<void> {
        await this.handlersManager.unSubscribe(params)
    }

    public async request<T>(params: { channel: string, data: { [index: string]: any }, options?: { timeout?: number } }): Promise<T> {
        return this.requestReplyManager.request(params)
    }

    public async onReply(params: { channel: string, fn: HandleFn, scope?: any }) {
        return this.requestReplyManager.onReply(params)

    }


}
