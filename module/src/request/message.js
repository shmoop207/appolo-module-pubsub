"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    constructor(params) {
        this._data = params.data;
        this._replyTo = params.replyTo;
        this._publishFn = params.publishFn;
    }
    get data() {
        return this._data;
    }
    get isAcked() {
        return this._isAcked;
    }
    reply(data) {
        return this._reply({
            success: true,
            data: data
        });
    }
    ;
    reject(e) {
        return this._reply({
            success: false,
            message: e && e.message,
            data: e && e.data
        });
    }
    _reply(data) {
        if (this._isAcked) {
            return;
        }
        this._isAcked = true;
        return this._publishFn(this._replyTo, data);
    }
}
exports.Message = Message;
//# sourceMappingURL=message.js.map