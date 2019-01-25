"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const index_1 = require("../../index");
let Publisher = class Publisher {
    async publish(str) {
        return str;
    }
};
tslib_1.__decorate([
    index_1.publisher("test")
], Publisher.prototype, "publish", null);
Publisher = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], Publisher);
exports.Publisher = Publisher;
//# sourceMappingURL=publisher.js.map