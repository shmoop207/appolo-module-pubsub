"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const pubSubProvider_1 = require("./src/pubSubProvider");
const _ = require("lodash");
const decorators_1 = require("./src/decorators");
let PubSubModule = class PubSubModule extends appolo_1.Module {
    constructor(options) {
        super(options);
        this.Defaults = {
            id: "pubSubProvider",
            auto: true
        };
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: pubSubProvider_1.PubSubProvider }];
    }
    beforeInitialize() {
        _.forEach(this.app.parent.exported, (item => this._createPublishers(item.fn)));
    }
    _createPublishers(fn) {
        let publishers = Reflect.getOwnMetadata(decorators_1.MessagePublisherSymbol, fn);
        if (!publishers) {
            return;
        }
        _.forEach(publishers, item => this._createPublisher(fn, item));
    }
    async _createPublisher(fn, item) {
        let old = fn.prototype[item.propertyKey];
        let $self = this;
        fn.prototype[item.propertyKey] = async function () {
            try {
                let result = await old.apply(this, arguments);
                let redis = $self.app.injector.get("redisPub").redis;
                await redis.publish(item.eventName, JSON.stringify(result));
                return result;
            }
            catch (e) {
                let logger = $self.app.injector.get("logger");
                logger.error(`failed to publish ${item.eventName}`, { e });
                return null;
            }
        };
    }
};
PubSubModule = tslib_1.__decorate([
    appolo_1.module()
], PubSubModule);
exports.PubSubModule = PubSubModule;
//# sourceMappingURL=pubSubModule.js.map