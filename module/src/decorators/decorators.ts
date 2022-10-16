import "reflect-metadata";
import {Util} from '@appolo/utils';

export const MessageHandlerSymbol = "__AppoloPubSubMessageHandler__";
export const ReplyHandlerSymbol = "__AppoloPubSubReplyHandler__";


export interface HandlerMetadata {
    [index: string]: {
        eventNames: string[]
        propertyKey: string,
        descriptor: PropertyDescriptor
    }
}

export interface PublisherMetadata {
    [index: string]: {
        eventName: string
        propertyKey: string,
        descriptor: PropertyDescriptor
    }
}


export function handler(channel: string) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.Reflector.getFnMetadata<HandlerMetadata>(MessageHandlerSymbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }

        data[propertyKey].eventNames.push(channel);
    }
}

export function reply(channel: string) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.Reflector.getFnMetadata<HandlerMetadata>(ReplyHandlerSymbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }

        data[propertyKey].eventNames.push(channel);
    }
}





