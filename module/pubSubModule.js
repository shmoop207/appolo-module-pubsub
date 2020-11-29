"use strict";
var PubSubModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubModule = void 0;
const tslib_1 = require("tslib");
const engine_1 = require("@appolo/engine");
const pubSubProvider_1 = require("./src/pubSubProvider");
let PubSubModule = PubSubModule_1 = class PubSubModule extends engine_1.Module {
    constructor() {
        super(...arguments);
        this.Defaults = {
            id: "pubSubProvider",
            auto: true
        };
    }
    static for(options) {
        return { type: PubSubModule_1, options };
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: pubSubProvider_1.PubSubProvider }];
    }
    beforeModuleInitialize() {
    }
};
PubSubModule = PubSubModule_1 = tslib_1.__decorate([
    engine_1.module()
], PubSubModule);
exports.PubSubModule = PubSubModule;
//# sourceMappingURL=pubSubModule.js.map