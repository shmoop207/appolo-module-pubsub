"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubProvider = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
let PubSubProvider = class PubSubProvider {
    constructor() {
        this._isInitialized = false;
    }
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        await this.handlersManager.initialize();
        await this.requestReplyManager.initialize();
        this._isInitialized = true;
    }
    async publish(channel, data) {
        await this.redisPub.redis.publish(channel, JSON.stringify(data || {}));
    }
    async on(params) {
        await this.handlersManager.subscribe(params);
    }
    async un(params) {
        await this.handlersManager.unSubscribe(params);
    }
    async request(params) {
        return this.requestReplyManager.request(params);
    }
    async onReply(params) {
        return this.requestReplyManager.onReply(params);
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], PubSubProvider.prototype, "redisPub", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], PubSubProvider.prototype, "handlersManager", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], PubSubProvider.prototype, "requestReplyManager", void 0);
PubSubProvider = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], PubSubProvider);
exports.PubSubProvider = PubSubProvider;
//# sourceMappingURL=pubSubProvider.js.map