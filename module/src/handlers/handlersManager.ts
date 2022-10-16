"use strict";
import {define, Define, inject, Injector, singleton} from '@appolo/inject'
import {IApp} from '@appolo/engine'
import {HandlerMetadata, MessageHandlerSymbol} from "../decorators/decorators";
import {RedisProvider} from "@appolo/redis/index";
import {IOptions} from "../common/interfaces/IOptions";
import {ILogger} from '@appolo/logger';
import {Strings, Objects, Arrays, Reflector, Promises} from '@appolo/utils';

export type HandleFn = (data: any, channel: string) => any

@define()
@singleton()
export class HandlersManager {

    @inject() private moduleOptions: IOptions;
    @inject() private injector: Injector;
    @inject() private app: IApp;
    @inject() protected redisSub: RedisProvider;
    @inject() protected logger: ILogger;

    private _handlers = new Map<string, { fn: HandleFn, scope: any }[]>();

    public async initialize() {

        let exported = this.app.tree.parent.discovery.findAllReflectData<HandlerMetadata>(MessageHandlerSymbol);

        await Promises.map(exported, item => this._createHandler(item), {concurrency: 5});

        this.redisSub.redis.on("message", this._onMessage.bind(this));
    }

    private _onMessage(channel: string, message: string): void {

        try {
            let handlers = this._handlers.get(channel);

            if (!handlers || !handlers.length) {
                return;
            }

            let msg = Objects.tryParseJSON(message) || message;

            handlers.forEach(item => this._handleOnMessage(item.fn, item.scope, channel, msg))

        } catch (e) {
            this.logger.error(`failed to handle message ${channel}`, {e, message})
            throw e;
        }
    }

    private _handleOnMessage(fn: HandleFn, scope: any, channel: string, msg: any) {
        try {
            fn.apply(scope, [msg, channel]);
        } catch (e) {
            this.logger.error(`failed to handle message ${channel}`, {e, msg})
            throw e;
        }
    }

    private async _createHandler(params: { fn: Function, define: Define, metaData: HandlerMetadata }) {

        let {fn, define, metaData} = params;

        let objectId = define.id

        let events: { channel: string, fn: HandleFn }[] = [];

        Arrays.forEach(metaData, handler => {

            Arrays.forEach(handler.eventNames, channel => {

                let fn = this._createHandlerFn(this.injector, objectId, handler.propertyKey)

                events.push({channel, fn})
            })

        });

        await Promises.map(events, event => this.subscribe({
            channel: event.channel,
            fn: event.fn,
            scope: null
        }), {concurrency: 5});

    }

    private _createHandlerFn(injector: Injector, objectId: string, propertyKey: string) {
        return (msg: any, channel: string) => {
            try {
                let handlerFn = injector.parent.get(objectId);

                handlerFn[propertyKey](msg, channel)
            } catch (e) {
                this.logger.error(`failed to run handler ${objectId} ${propertyKey}`)
            }
        }
    }

    public isChannelSubscribed(channel: string): boolean {
        return this._handlers.has(channel)
    }

    public async subscribe(params: { channel: string, fn: HandleFn, scope: any }): Promise<void> {
        let {channel, fn, scope} = params;

        try {
            if (!this._handlers.has(channel)) {
                this._handlers.set(channel, []);
            }

            this._handlers.get(channel).push({fn, scope: scope});

            await this.redisSub.redis.subscribe(channel);

        } catch (e) {
            this.logger.error(`failed to subscribe to ${channel}`, {e});
            throw e;
        }
    }

    public async unSubscribe(params: { channel: string, fn?: HandleFn, scope?: any }): Promise<void> {
        let {channel, fn, scope} = params;

        try {

            if (this._handlers.has(channel)) {
                let handlers = this._handlers.get(channel) || [];
                Arrays.removeBy(handlers, item => (!fn || !item.fn || item.fn === fn) && (!scope || !item.scope || item.scope === scope));

                if (handlers.length == 0) {
                    this._handlers.delete(channel);
                    await this.redisSub.redis.unsubscribe(channel);

                }
            }

        } catch (e) {
            this.logger.error(`failed to unSubscribe from ${channel}`, {e});
            throw e;
        }
    }


}
