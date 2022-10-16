"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlersManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const decorators_1 = require("../decorators/decorators");
const utils_1 = require("@appolo/utils");
let HandlersManager = class HandlersManager {
    constructor() {
        this._handlers = new Map();
    }
    async initialize() {
        let exported = this.app.tree.parent.discovery.findAllReflectData(decorators_1.MessageHandlerSymbol);
        await utils_1.Promises.map(exported, item => this._createHandler(item), { concurrency: 5 });
        this.redisSub.redis.on("message", this._onMessage.bind(this));
    }
    _onMessage(channel, message) {
        try {
            let handlers = this._handlers.get(channel);
            if (!handlers || !handlers.length) {
                return;
            }
            let msg = utils_1.Objects.tryParseJSON(message) || message;
            handlers.forEach(item => this._handleOnMessage(item.fn, item.scope, channel, msg));
        }
        catch (e) {
            this.logger.error(`failed to handle message ${channel}`, { e, message });
            throw e;
        }
    }
    _handleOnMessage(fn, scope, channel, msg) {
        try {
            fn.apply(scope, [msg, channel]);
        }
        catch (e) {
            this.logger.error(`failed to handle message ${channel}`, { e, msg });
            throw e;
        }
    }
    async _createHandler(params) {
        let { fn, define, metaData } = params;
        let objectId = define.id;
        let events = [];
        utils_1.Arrays.forEach(metaData, handler => {
            utils_1.Arrays.forEach(handler.eventNames, channel => {
                let fn = this._createHandlerFn(this.injector, objectId, handler.propertyKey);
                events.push({ channel, fn });
            });
        });
        await utils_1.Promises.map(events, event => this.subscribe({
            channel: event.channel,
            fn: event.fn,
            scope: null
        }), { concurrency: 5 });
    }
    _createHandlerFn(injector, objectId, propertyKey) {
        return (msg, channel) => {
            try {
                let handlerFn = injector.parent.get(objectId);
                handlerFn[propertyKey](msg, channel);
            }
            catch (e) {
                this.logger.error(`failed to run handler ${objectId} ${propertyKey}`);
            }
        };
    }
    isChannelSubscribed(channel) {
        return this._handlers.has(channel);
    }
    async subscribe(params) {
        let { channel, fn, scope } = params;
        try {
            if (!this._handlers.has(channel)) {
                this._handlers.set(channel, []);
            }
            this._handlers.get(channel).push({ fn, scope: scope });
            await this.redisSub.redis.subscribe(channel);
        }
        catch (e) {
            this.logger.error(`failed to subscribe to ${channel}`, { e });
            throw e;
        }
    }
    async unSubscribe(params) {
        let { channel, fn, scope } = params;
        try {
            if (this._handlers.has(channel)) {
                let handlers = this._handlers.get(channel) || [];
                utils_1.Arrays.removeBy(handlers, item => (!fn || !item.fn || item.fn === fn) && (!scope || !item.scope || item.scope === scope));
                if (handlers.length == 0) {
                    this._handlers.delete(channel);
                    await this.redisSub.redis.unsubscribe(channel);
                }
            }
        }
        catch (e) {
            this.logger.error(`failed to unSubscribe from ${channel}`, { e });
            throw e;
        }
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], HandlersManager.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], HandlersManager.prototype, "injector", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], HandlersManager.prototype, "app", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], HandlersManager.prototype, "redisSub", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], HandlersManager.prototype, "logger", void 0);
HandlersManager = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], HandlersManager);
exports.HandlersManager = HandlersManager;
//# sourceMappingURL=handlersManager.js.map