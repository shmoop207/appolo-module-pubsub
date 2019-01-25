import {bootstrap, define, IBootstrap, inject} from 'appolo'
import {PubSubProvider} from "./pubSubProvider";
import {IOptions} from "./IOptions";

@define()
@bootstrap()
export class Bootstrap implements IBootstrap {

    @inject() private moduleOptions: IOptions;
    @inject() pubSubProvider: PubSubProvider;

    public async run(): Promise<void> {
        if (this.moduleOptions.auto) {
            await this.pubSubProvider.initialize();
        }
    }
}