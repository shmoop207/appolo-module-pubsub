"use strict";
import {define, Define, inject, Injector, singleton} from '@appolo/inject'
import {IApp} from '@appolo/core'
import * as _ from "lodash";
import {MessageHandlerSymbol,} from "./decorators";
import {RedisProvider} from "@appolo/redis/index";
import {IOptions} from "./IOptions";
import {ILogger} from '@appolo/logger';

@define()
@singleton()
export class HandlersManager {

    @inject() private moduleOptions: IOptions;
    @inject() private injector: Injector;
    @inject() private app: IApp;
    @inject() protected redisSub: RedisProvider;
    @inject() protected logger: ILogger;

    private _handlers = new Map<string, { define: Define, propertyKey: string }[]>();

    public async initialize() {

        _.forEach(this.app.tree.parent.discovery.exported, (item => this._createHandler(item.fn, item.define)));

        this.redisSub.redis.on("message", this._onMessage.bind(this));
    }

    private _onMessage(channel: string, message: string): void {

        try {
            let handlers = this._handlers.get(channel);

            if (!handlers || !handlers.length) {
                return;
            }

            let msg = JSON.parse(message);

            _.forEach(handlers, item => this._handleMessage(item.define.definition.id, item.propertyKey, channel, msg))

        } catch (e) {
            this.logger.error(`failed to handle message ${channel}`, {e, message})

        }
    }

    private _handleMessage(id: string, propertyKey: string, channel: string, msg: any) {
        try {
            let handler = this.injector.parent.get(id);

            handler[propertyKey](msg)

        } catch (e) {
            this.logger.error(`failed to handle message ${channel}`, {e, msg})
        }
    }

    private _createHandler(fn: Function, define: Define) {

        let handlers = Reflect.getOwnMetadata(MessageHandlerSymbol, fn);

        if (!handlers) {
            return;
        }

        _.forEach(handlers, handler => {

            _.forEach(handler.eventNames, eventName => {

                if (!this._handlers.has(eventName)) {
                    this._handlers.set(eventName, []);
                }

                this._handlers.get(eventName).push({define, propertyKey: handler.propertyKey});

                this.redisSub.redis.subscribe(eventName);

            })

        });

    }


}
