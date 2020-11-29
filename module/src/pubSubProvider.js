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
        this._isInitialized = true;
    }
    async publish(channel, message) {
        await this.redisPub.redis.publish(channel, JSON.stringify(message));
    }
};
tslib_1.__decorate([
    inject_1.inject()
], PubSubProvider.prototype, "redisPub", void 0);
tslib_1.__decorate([
    inject_1.inject()
], PubSubProvider.prototype, "handlersManager", void 0);
PubSubProvider = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], PubSubProvider);
exports.PubSubProvider = PubSubProvider;
//# sourceMappingURL=pubSubProvider.js.map