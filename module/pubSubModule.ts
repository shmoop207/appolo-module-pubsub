import {module, Module, Util} from 'appolo';
import {IOptions} from "./src/IOptions";
import {ILogger} from '@appolo/logger';

import {PubSubProvider} from "./src/pubSubProvider";
import * as _ from "lodash";
import {MessagePublisherSymbol, PublisherMetadata} from "./src/decorators";

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

        let publisherMeta = Util.findAllReflectData<PublisherMetadata>(MessagePublisherSymbol, this.app.parent.exported);

        _.forEach(publisherMeta, (item => this._createPublishers(item)));

    }

    private _createPublishers(item: { fn: Function, metaData: PublisherMetadata }) {

        _.forEach(item.metaData, publisher => this._createPublisher(item.fn, publisher));
    }

    private async _createPublisher(fn: Function, item: { propertyKey: string, eventName: string }) {
        let old = fn.prototype[item.propertyKey];

        let $self = this;

        fn.prototype[item.propertyKey] = async function (): Promise<any> {

            try {
                let result = await old.apply(this, arguments);

                let provider = $self.app.injector.get<PubSubProvider>(PubSubProvider);

                await provider.publish(item.eventName, result);

                return result

            } catch (e) {
                let logger = $self.app.injector.get<ILogger>("logger");

                logger.error(`failed to publish ${item.eventName}`, {e});

                throw e;
            }


        }
    }
}