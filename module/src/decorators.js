"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const appolo_1 = require("appolo");
exports.MessageHandlerSymbol = Symbol("MessageHandler");
exports.MessagePublisherSymbol = Symbol("MessagePublisher");
function handler(eventName) {
    return function (target, propertyKey, descriptor) {
        let data = appolo_1.Util.getReflectData(exports.MessageHandlerSymbol, target.constructor, {});
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
function publisher(eventName) {
    return function (target, propertyKey, descriptor) {
        let data = appolo_1.Util.getReflectData(exports.MessagePublisherSymbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventName,
                propertyKey,
                descriptor
            };
        }
    };
}
exports.publisher = publisher;
//# sourceMappingURL=decorators.js.map