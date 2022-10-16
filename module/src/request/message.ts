import {RequestError} from "../common/errors/requestError";
import {IRequestReplyMessage} from "./requestReplyManager";

export class Message<T> {

    private readonly _data: T;
    private _isAcked: boolean
    private readonly _replyTo: string;
    private readonly _publishFn: (channel: string, data?: { [index: string]: any }) => Promise<void>


    constructor(params: { data: T, replyTo: string, publishFn: (channel: string, data: { [index: string]: any }) => Promise<void> }) {
        this._data = params.data;
        this._replyTo = params.replyTo
        this._publishFn = params.publishFn
    }


    public get data() {
        return this._data;
    }

    public get isAcked(): boolean {
        return this._isAcked
    }

    public reply(data?: { [index: string]: any }): Promise<void> {

        return this._reply({
            success: true,
            data: data
        })
    };


    public reject(e: RequestError<T>): Promise<void> {
        return this._reply({
            success: false,
            message: e && e.message,
            data: e && e.data
        })
    }

    private _reply(data: IRequestReplyMessage) {
        if (this._isAcked) {
            return;
        }

        this._isAcked = true;

        return this._publishFn(this._replyTo, data)
    }
}
