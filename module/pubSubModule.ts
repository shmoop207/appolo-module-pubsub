import {module, Module, IModuleParams} from '@appolo/engine';
import {IOptions} from "./src/IOptions";
import {ILogger} from '@appolo/logger';
import {Reflector} from '@appolo/utils';

import {PubSubProvider} from "./src/pubSubProvider";
import * as _ from "lodash";

@module()
export class PubSubModule extends Module<IOptions> {

    protected readonly Defaults = <Partial<IOptions>>{
        id: "pubSubProvider",
        auto: true
    };

    public static for(options: IOptions): IModuleParams {
        return {type: PubSubModule, options}
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: PubSubProvider}];
    }

    public beforeModuleInitialize() {

    }
}
