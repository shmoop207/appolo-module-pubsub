import {define, singleton ,inject} from '@appolo/inject'
import { PubSubProvider} from "../../index";

@define()
@singleton()
export class Publisher {

    @inject() pubSubProvider:PubSubProvider

    public async publish(value: any): Promise<any> {
        return this.pubSubProvider.publish("test",value)
    }
}
