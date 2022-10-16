import {alias, define, singleton} from '@appolo/inject'
import {reply, RequestError, Message} from "../../index";

@define()
@singleton()
export class Reply {


    @reply("testReplyDecoratorError")
    handle(msg: Message<any>) {
        throw new Error(`invalid decorator`)
    }

    @reply("testReplyDecorator")
    handle2(msg: Message<any>) {
        return {working:2,data:msg.data}
    }
}
