import {define, singleton} from 'appolo'
import {publisher} from "../../index";

@define()
@singleton()
export class Publisher {

    @publisher("test")
    async publish(str: { working: "bla" }): Promise<any> {
        return str
    }
}