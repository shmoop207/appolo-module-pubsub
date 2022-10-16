"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reply = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const index_1 = require("../../index");
let Reply = class Reply {
    handle(msg) {
        throw new Error(`invalid decorator`);
    }
    handle2(msg) {
        return { working: 2, data: msg.data };
    }
};
tslib_1.__decorate([
    (0, index_1.reply)("testReplyDecoratorError")
], Reply.prototype, "handle", null);
tslib_1.__decorate([
    (0, index_1.reply)("testReplyDecorator")
], Reply.prototype, "handle2", null);
Reply = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], Reply);
exports.Reply = Reply;
//# sourceMappingURL=reply.js.map