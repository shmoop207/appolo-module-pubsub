"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reply = exports.handler = exports.ReplyHandlerSymbol = exports.MessageHandlerSymbol = void 0;
require("reflect-metadata");
const utils_1 = require("@appolo/utils");
exports.MessageHandlerSymbol = "__AppoloPubSubMessageHandler__";
exports.ReplyHandlerSymbol = "__AppoloPubSubReplyHandler__";
function handler(channel) {
    return function (target, propertyKey, descriptor) {
        let data = utils_1.Util.Reflector.getFnMetadata(exports.MessageHandlerSymbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }
        data[propertyKey].eventNames.push(channel);
    };
}
exports.handler = handler;
function reply(channel) {
    return function (target, propertyKey, descriptor) {
        let data = utils_1.Util.Reflector.getFnMetadata(exports.ReplyHandlerSymbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }
        data[propertyKey].eventNames.push(channel);
    };
}
exports.reply = reply;
//# sourceMappingURL=decorators.js.map