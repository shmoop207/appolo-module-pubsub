import { createApp, App } from 'appolo'
import chai = require('chai');
import    sinonChai = require("sinon-chai");
import * as Q from 'bluebird'
import {Handler} from "./src/handler";
import {PubSubModule} from "../index";
import {Publisher} from "./src/publisher";


let should = require('chai').should();
chai.use(sinonChai);


describe("PubSub Spec", function () {

    let app: App;

    if(!process.env.REDIS){
        throw new Error(`please define process.env.REDIS`)
    }

    beforeEach(async () => {

         app = createApp({root: __dirname, environment: "production", port: 8181});

        await app.module(new PubSubModule({connection: process.env.REDIS}));

        await app.launch();

    });

    it("should publish events", async () => {


         await app.injector.get<Publisher>(Publisher).publish({working:"bla"});

         await Q.delay(100);

         app.injector.get<Handler>(Handler).working.should.be.eq("bla");

        await app.reset();
    })
});


