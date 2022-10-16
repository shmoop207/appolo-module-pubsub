"use strict";
import {define, Define, inject, Injector, singleton} from '@appolo/inject'
import {IApp} from '@appolo/engine'
import {HandlerMetadata, MessageHandlerSymbol, ReplyHandlerSymbol} from "../decorators/decorators";
import {RedisProvider} from "@appolo/redis/index";
import {IOptions} from "../common/interfaces/IOptions";
import {ILogger} from '@appolo/logger';
import {Strings, Objects, Arrays, Reflector, Promises, Guid} from '@appolo/utils';
import {HandleFn, HandlersManager} from "../handlers/handlersManager";
import {RequestError} from "../common/errors/requestError";
import {PubSubProvider} from "../providers/pubSubProvider";
import {Message} from "./message";

export interface IRequestReplyMessage {
    success: boolean,
    data: any,
    message?: string
    replyTo?: string
}

export type ReplyHandleFn<T> = (msg: Message<T>) => any


@define()
@singleton()
export class RequestReplyManager {

    @inject() private moduleOptions: IOptions;
    @inject() private injector: Injector;
    @inject() private app: IApp;
    @inject() protected redisPub: RedisProvider;
    @inject() protected logger: ILogger;
    @inject() protected handlersManager: HandlersManager;
    @inject() protected pubSubProvider: PubSubProvider;

    private _hostGuid: string;


    public async initialize() {

        this._hostGuid = Guid.guid();

        let exported = this.app.tree.parent.discovery.findAllReflectData<HandlerMetadata>(ReplyHandlerSymbol);

        await Promises.map(exported, item => this._createReplyHandler(item), {concurrency: 5});

    }

    private async _createReplyHandler(params: { fn: Function, define: Define, metaData: HandlerMetadata }) {
        let {define, metaData} = params;

        let objectId = define.id;

        let events: { channel: string, fn: ReplyHandleFn<any> }[] = [];

        Arrays.forEach(metaData, handler => {

            Arrays.forEach(handler.eventNames, channel => {

                let fn = this._createReplyFn(this.injector, objectId, handler.propertyKey)
                events.push({channel, fn})
            })

        });

        await Promises.map(events, event => this.onReply({
            channel: event.channel,
            fn: event.fn,
            scope: null
        }), {concurrency: 5});
    }

    private _createReplyFn(injector: Injector, objectId: string, propertyKey: string) {
        return async (msg: Message<any>) => {
            try {
                let handlerFn = injector.parent.get(objectId);

                let result = await handlerFn[propertyKey](msg);

                if (!msg.isAcked) {
                    await msg.reply(result);
                }

            } catch (e) {

                if (!(e instanceof RequestError)) {
                    e = new RequestError<any>(e.message);
                }

                await msg.reject(e)
            }

        }
    }

    public async onReply(params: { channel: string, fn: HandleFn, scope?: any }) {
        let {channel, fn, scope} = params;

        channel = `${channel}__${this._hostGuid}__request`;

        if (this.handlersManager.isChannelSubscribed(channel)) {
            throw new Error(`channel ${channel} already has reply`)
        }

        let replyFn: HandleFn = (data: IRequestReplyMessage) => {

            let publishFn = (channel: string, data: { [index: string]: any }) => {
                return this.pubSubProvider.publish(channel, data)
            }

            let msg = new Message({replyTo: data.replyTo, data: data.data, publishFn})

            fn.apply(scope || null, [msg]);
        }

        await this.handlersManager.subscribe({channel, fn: replyFn, scope: null})
    }

    public async unReply(params: { channel: string }) {
        return this.handlersManager.unSubscribe({channel: params.channel})
    }


    public async request<T>(params: { channel: string, data: { [index: string]: any }, options?: { timeout?: number } }): Promise<T> {

        try {
            let {channel, data, options = {}} = params

            let result = await Promises.timeout<T>(this._createReplyPromise({channel, data}), options.timeout || 5000);

            return result;
        } catch (e) {

            (e.message == "promise timeout") && (e = new RequestError(e.message))

            throw e;
        }

    }

    private _createReplyPromise<T>(params: { channel: string, data: { [index: string]: any } }): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let {channel, data} = params

            try {
                let channelReply = `request_${Guid.guid()}`;

                let channelPattern = `${channel}__*__request`;

                let msg: IRequestReplyMessage = {
                    success: true,
                    data: data || {},
                    replyTo: channelReply
                }

                let fn: HandleFn = this._createReply(resolve, reject, channelReply)

                await this.handlersManager.subscribe({channel: channelReply, fn, scope: null});

                let result = await this.redisPub.runScript("publishRandomHost",[],[channelPattern,JSON.stringify(msg)])

                return result;
            } catch (e) {
                reject(e);
            }
        });
    }

    private _createReply(resolve: Function, reject: Function, channelReply: string) {

        return async (data: IRequestReplyMessage) => {
            try {
                await this.handlersManager.unSubscribe({channel: channelReply})

                if (data.success) {
                    resolve(data.data);
                } else {
                    reject(new RequestError(data.message, data.data))
                }
            } catch (e) {
                reject(new RequestError(e.message, data.data))
            }
        }


    }

}
