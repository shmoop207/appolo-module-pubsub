"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
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
    inject_1.define(),
    inject_1.singleton()
], Handler);
exports.Handler = Handler;
//# sourceMappingURL=handler.js.map