"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.MessageHandlerSymbol = void 0;
require("reflect-metadata");
const utils_1 = require("@appolo/utils");
exports.MessageHandlerSymbol = Symbol("MessageHandler");
function handler(eventName) {
    return function (target, propertyKey, descriptor) {
        let data = utils_1.Util.Reflector.getFnMetadata(exports.MessageHandlerSymbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }
        data[propertyKey].eventNames.push(eventName);
    };
}
exports.handler = handler;
//# sourceMappingURL=decorators.js.map