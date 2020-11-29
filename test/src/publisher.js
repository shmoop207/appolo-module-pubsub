"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
let Publisher = class Publisher {
    async publish(value) {
        return this.pubSubProvider.publish("test", value);
    }
};
tslib_1.__decorate([
    inject_1.inject()
], Publisher.prototype, "pubSubProvider", void 0);
Publisher = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], Publisher);
exports.Publisher = Publisher;
//# sourceMappingURL=publisher.js.map