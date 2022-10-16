"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestReplyManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const decorators_1 = require("../decorators/decorators");
const utils_1 = require("@appolo/utils");
const requestError_1 = require("../common/errors/requestError");
const message_1 = require("./message");
let RequestReplyManager = class RequestReplyManager {
    async initialize() {
        this._hostGuid = utils_1.Guid.guid();
        let exported = this.app.tree.parent.discovery.findAllReflectData(decorators_1.ReplyHandlerSymbol);
        await utils_1.Promises.map(exported, item => this._createReplyHandler(item), { concurrency: 5 });
    }
    async _createReplyHandler(params) {
        let { define, metaData } = params;
        let objectId = define.id;
        let events = [];
        utils_1.Arrays.forEach(metaData, handler => {
            utils_1.Arrays.forEach(handler.eventNames, channel => {
                let fn = this._createReplyFn(this.injector, objectId, handler.propertyKey);
                events.push({ channel, fn });
            });
        });
        await utils_1.Promises.map(events, event => this.onReply({
            channel: event.channel,
            fn: event.fn,
            scope: null
        }), { concurrency: 5 });
    }
    _createReplyFn(injector, objectId, propertyKey) {
        return async (msg) => {
            try {
                let handlerFn = injector.parent.get(objectId);
                let result = await handlerFn[propertyKey](msg);
                if (!msg.isAcked) {
                    await msg.reply(result);
                }
            }
            catch (e) {
                if (!(e instanceof requestError_1.RequestError)) {
                    e = new requestError_1.RequestError(e.message);
                }
                await msg.reject(e);
            }
        };
    }
    async onReply(params) {
        let { channel, fn, scope } = params;
        channel = `${channel}__${this._hostGuid}__request`;
        if (this.handlersManager.isChannelSubscribed(channel)) {
            throw new Error(`channel ${channel} already has reply`);
        }
        let replyFn = (data) => {
            let publishFn = (channel, data) => {
                return this.pubSubProvider.publish(channel, data);
            };
            let msg = new message_1.Message({ replyTo: data.replyTo, data: data.data, publishFn });
            fn.apply(scope || null, [msg]);
        };
        await this.handlersManager.subscribe({ channel, fn: replyFn, scope: null });
    }
    async unReply(params) {
        return this.handlersManager.unSubscribe({ channel: params.channel });
    }
    async request(params) {
        try {
            let { channel, data, options = {} } = params;
            let result = await utils_1.Promises.timeout(this._createReplyPromise({ channel, data }), options.timeout || 5000);
            return result;
        }
        catch (e) {
            (e.message == "promise timeout") && (e = new requestError_1.RequestError(e.message));
            throw e;
        }
    }
    _createReplyPromise(params) {
        return new Promise(async (resolve, reject) => {
            let { channel, data } = params;
            try {
                let channelReply = `request_${utils_1.Guid.guid()}`;
                let channelPattern = `${channel}__*__request`;
                let msg = {
                    success: true,
                    data: data || {},
                    replyTo: channelReply
                };
                let fn = this._createReply(resolve, reject, channelReply);
                await this.handlersManager.subscribe({ channel: channelReply, fn, scope: null });
                let result = await this.redisPub.runScript("publishRandomHost", [], [channelPattern, JSON.stringify(msg)]);
                return result;
            }
            catch (e) {
                reject(e);
            }
        });
    }
    _createReply(resolve, reject, channelReply) {
        return async (data) => {
            try {
                await this.handlersManager.unSubscribe({ channel: channelReply });
                if (data.success) {
                    resolve(data.data);
                }
                else {
                    reject(new requestError_1.RequestError(data.message, data.data));
                }
            }
            catch (e) {
                reject(new requestError_1.RequestError(e.message, data.data));
            }
        };
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], RequestReplyManager.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], RequestReplyManager.prototype, "injector", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], RequestReplyManager.prototype, "app", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], RequestReplyManager.prototype, "redisPub", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], RequestReplyManager.prototype, "logger", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], RequestReplyManager.prototype, "handlersManager", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], RequestReplyManager.prototype, "pubSubProvider", void 0);
RequestReplyManager = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], RequestReplyManager);
exports.RequestReplyManager = RequestReplyManager;
//# sourceMappingURL=requestReplyManager.js.map