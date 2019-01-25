"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
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
    appolo_1.inject()
], PubSubProvider.prototype, "redisPub", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], PubSubProvider.prototype, "handlersManager", void 0);
PubSubProvider = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], PubSubProvider);
exports.PubSubProvider = PubSubProvider;
//# sourceMappingURL=pubSubProvider.js.map