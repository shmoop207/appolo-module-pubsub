import { define, inject} from '@appolo/inject'
import { IBootstrap,bootstrap } from '@appolo/engine'
import {PubSubProvider} from "./providers/pubSubProvider";
import {IOptions} from "./common/interfaces/IOptions";

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
