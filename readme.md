
pubsub module for [`appolo`](https://github.com/shmoop207/appolo) build with [ioredis](https://github.com/luin/ioredis#pubsub)

## Installation

```javascript
npm i @appolo/pubsub
```

## Options
| key | Description | Type | Default
| --- | --- | --- | --- |
| `id` | `PubSubProvider` injection id | `string`|  `pubSubProvider`|
| `auto` | true to auto initialize pubsub listen events | `boolean` | `true` |
| `connection` | redis connection string | `string` | null |

in config/modules/all.ts

```javascript
import {PubSubModule} from '@appolo/pubsub';

export = async function (app: App) {
   await app.module(new PubSubModule({redis:"redis://redis-connection-string"}));
}
```

## Usage

### Publisher
```javascript
import {define, singleton} from 'appolo'
import {publisher} from "@appolo/pubsub";

@define()
@singleton()
export class SomePublisher {

    @publisher("test")
    async publish(data: any): Promise<any> {
        return data
    }
}
```
Or with PubSubProvider
```javascript
@define()
@singleton()
export class SomePublisher {

    inject() pubSubProvider:PubSubProvider

    async publish(data:any): Promise<any> {
        return this.pubSubProvider.publish("test",data)
    }
}

```
### Handler
```javascript
import {define, singleton} from 'appolo'
import {handler} from "@appolo/pubsub";

@define()
@singleton()
export class SomeHandler {

    @handler("test")
    handle(data: any) {
       //do something
    }

    @handler("someName")
    handle(data: any) {
        //do some thing
    }
}
