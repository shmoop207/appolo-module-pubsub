"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlersManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const _ = require("lodash");
const decorators_1 = require("./decorators");
let HandlersManager = class HandlersManager {
    constructor() {
        this._handlers = new Map();
    }
    async initialize() {
        _.forEach(this.app.tree.parent.discovery.exported, (item => this._createHandler(item.fn, item.define)));
        this.redisSub.redis.on("message", this._onMessage.bind(this));
    }
    _onMessage(channel, message) {
        try {
            let handlers = this._handlers.get(channel);
            if (!handlers || !handlers.length) {
                return;
            }
            let msg = JSON.parse(message);
            _.forEach(handlers, item => this._handleMessage(item.define.definition.id, item.propertyKey, channel, msg));
        }
        catch (e) {
            this.logger.error(`failed to handle message ${channel}`, { e, message });
        }
    }
    _handleMessage(id, propertyKey, channel, msg) {
        try {
            let handler = this.injector.parent.get(id);
            handler[propertyKey](msg);
        }
        catch (e) {
            this.logger.error(`failed to handle message ${channel}`, { e, msg });
        }
    }
    _createHandler(fn, define) {
        let handlers = Reflect.getOwnMetadata(decorators_1.MessageHandlerSymbol, fn);
        if (!handlers) {
            return;
        }
        _.forEach(handlers, handler => {
            _.forEach(handler.eventNames, eventName => {
                if (!this._handlers.has(eventName)) {
                    this._handlers.set(eventName, []);
                }
                this._handlers.get(eventName).push({ define, propertyKey: handler.propertyKey });
                this.redisSub.redis.subscribe(eventName);
            });
        });
    }
};
tslib_1.__decorate([
    inject_1.inject()
], HandlersManager.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    inject_1.inject()
], HandlersManager.prototype, "injector", void 0);
tslib_1.__decorate([
    inject_1.inject()
], HandlersManager.prototype, "app", void 0);
tslib_1.__decorate([
    inject_1.inject()
], HandlersManager.prototype, "redisSub", void 0);
tslib_1.__decorate([
    inject_1.inject()
], HandlersManager.prototype, "logger", void 0);
HandlersManager = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], HandlersManager);
exports.HandlersManager = HandlersManager;
//# sourceMappingURL=handlersManager.js.map