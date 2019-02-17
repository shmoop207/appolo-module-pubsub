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
        let publisherMeta = appolo_1.Util.findAllReflectData(decorators_1.MessagePublisherSymbol, this.app.parent.exported);
        _.forEach(publisherMeta, (item => this._createPublishers(item)));
    }
    _createPublishers(item) {
        _.forEach(item.metaData, publisher => this._createPublisher(item.fn, publisher));
    }
    async _createPublisher(fn, item) {
        let old = fn.prototype[item.propertyKey];
        let $self = this;
        fn.prototype[item.propertyKey] = async function () {
            try {
                let result = await old.apply(this, arguments);
                let provider = $self.app.injector.get(pubSubProvider_1.PubSubProvider);
                await provider.publish(item.eventName, result);
                return result;
            }
            catch (e) {
                let logger = $self.app.injector.get("logger");
                logger.error(`failed to publish ${item.eventName}`, { e });
                throw e;
            }
        };
    }
};
PubSubModule = tslib_1.__decorate([
    appolo_1.module()
], PubSubModule);
exports.PubSubModule = PubSubModule;
//# sourceMappingURL=pubSubModule.js.map