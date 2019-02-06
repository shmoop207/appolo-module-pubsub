import "reflect-metadata";
import {Util} from 'appolo';

export const MessageHandlerSymbol = Symbol("MessageHandler");
export const MessagePublisherSymbol = Symbol("MessagePublisher");


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


export function handler(eventName: string) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.getReflectData<HandlerMetadata>(MessageHandlerSymbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }

        data[propertyKey].eventNames.push(
            eventName);
    }
}

export function publisher(eventName: string) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.getReflectData<PublisherMetadata>(MessagePublisherSymbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventName,
                propertyKey,
                descriptor
            };
        }
    }
}



