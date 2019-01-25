import "reflect-metadata";
import {Util} from 'appolo';

export const MessageHandlerSymbol = Symbol("MessageHandler");
export const MessagePublisherSymbol = Symbol("MessagePublisher");


export interface HandlerMetadataOptions {
    [index: string]: {
        eventNames: string[]
        propertyKey: string,
        descriptor: PropertyDescriptor
    }
}

export interface PublisherMetadataOptions {
    [index: string]: {
        eventName: string
        propertyKey: string,
        descriptor: PropertyDescriptor
    }
}


export function handler(eventName: string) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.getReflectData<HandlerMetadataOptions>(MessageHandlerSymbol, target.constructor, {});

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

        let data = Util.getReflectData<PublisherMetadataOptions>(MessagePublisherSymbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventName,
                propertyKey,
                descriptor
            };
        }
    }
}



