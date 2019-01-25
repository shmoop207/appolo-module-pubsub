import {module, Module} from 'appolo';
import {IOptions} from "./src/IOptions";
import {ILogger} from '@appolo/logger';

import {PubSubProvider} from "./src/pubSubProvider";
import * as _ from "lodash";
import {MessagePublisherSymbol} from "./src/decorators";
import {RedisProvider} from "@appolo/redis/index";

@module()
export class PubSubModule extends Module<IOptions> {

    protected readonly Defaults = <Partial<IOptions>>{
        id: "pubSubProvider",
        auto: true
    };

    constructor(options: IOptions) {
        super(options)
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: PubSubProvider}];
    }

    protected beforeInitialize() {

        _.forEach(this.app.parent.exported, (item => this._createPublishers(item.fn)));

    }

    private _createPublishers(fn: Function) {

        let publishers = Reflect.getOwnMetadata(MessagePublisherSymbol, fn);

        if (!publishers) {
            return;
        }

        _.forEach(publishers, item => this._createPublisher(fn, item));
    }

    private async _createPublisher(fn: Function, item: { propertyKey: string, eventName: string }) {
        let old = fn.prototype[item.propertyKey];

        let $self = this;

        fn.prototype[item.propertyKey] = async function (): Promise<any> {

            try {
                let result = await old.apply(this, arguments);

                let redis = $self.app.injector.get<RedisProvider>("redisPub").redis;

                await redis.publish(item.eventName, JSON.stringify(result));

                return result

            } catch (e) {
                let logger = $self.app.injector.get<ILogger>("logger");

                logger.error(`failed to publish ${item.eventName}`, {e});

                return null;
            }


        }
    }
}