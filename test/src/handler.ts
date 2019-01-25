import {alias, define,singleton} from 'appolo'
import { handler } from "../../index";

@define()
@singleton()
export class Handler {

    public working: string;

    @handler("test")
    handle(msg: { working: string }) {
        this.working = msg.working;
    }
}