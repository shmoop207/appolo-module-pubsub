"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const index_1 = require("../../index");
let Handler = class Handler {
    handle(msg) {
        this.working = msg.working;
    }
};
tslib_1.__decorate([
    index_1.handler("test")
], Handler.prototype, "handle", null);
Handler = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], Handler);
exports.Handler = Handler;
//# sourceMappingURL=handler.js.map