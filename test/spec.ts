import {createApp, App} from '@appolo/engine'
import chai = require('chai');
import sinonChai = require("sinon-chai");
import {Handler} from "./src/handler";
import {PubSubModule, PubSubProvider, RequestError, Message} from "../index";
import {Promises} from "@appolo/utils";
import {Publisher} from "./src/publisher";
import {afterEach} from "mocha";


let should = require('chai').should();
chai.use(sinonChai);


describe("PubSub Spec", function () {

    let app: App;

    if (!process.env.REDIS) {
        throw new Error(`please define process.env.REDIS`)
    }

    beforeEach(async () => {

        app = createApp({root: __dirname, environment: "production"});

        app.module.use(PubSubModule.for({connection: process.env.REDIS}));

        await app.launch();

    });

    afterEach(async () => {
        await app.reset();
    })

    it("should publish events", async () => {


        await app.injector.get<Publisher>(Publisher).publish({working: "bla"});

        await Promises.delay(1000);

        app.injector.get<Handler>(Handler).working.should.be.eq("bla");


    })


    it("should request reply events", async () => {


        let provider = app.injector.get<PubSubProvider>("pubSubProvider")

        let replyFn = (msg: Message<any>) => {
            msg.reply({working: "yay", data: msg.data});
        }

        await provider.onReply({channel: "testReply", fn: replyFn})

        let result = await provider.request<{ working: string, data: { test: number } }>({
            channel: "testReply",
            data: {"test": 1},
            options: {timeout: 100000}
        })

        result.working.should.be.eq("yay")
        result.data.test.should.be.eq(1)
    })

    it("should request reply events timeout", async () => {

        let provider = app.injector.get<PubSubProvider>("pubSubProvider")

        let replyFn = (msg: Message<any>) => {
            msg.reply({working: "yay", data: msg.data});
        }

        await provider.onReply({channel: "testReply", fn: replyFn})


        try {
            let result = await provider.request<{ working: string, data: { test: number } }>({
                channel: "testReply",
                data: {"test": 1},
                options: {timeout: 1}
            })
            result.should.not.be.ok;
        } catch (e) {
            e.message.should.be.eq("timeout")
        }
    })

    it("should request reply events reject", async () => {

        let provider = app.injector.get<PubSubProvider>("pubSubProvider")

        let replyFn = (msg: Message<any>) => {
            msg.reject(new RequestError<any>("invalid test"));
        }

        await provider.onReply({channel: "testReply", fn: replyFn})


        try {
            let result = await provider.request<{ working: string, data: { test: number } }>({
                channel: "testReply",
                data: {"test": 1},
                options: {timeout: 10000}
            })
            result.should.not.be.ok;
        } catch (e) {
            e.message.should.be.eq("invalid test")
        }
    })

    it("should request reply events decorator reject", async () => {

        let provider = app.injector.get<PubSubProvider>("pubSubProvider")


        try {
            let result = await provider.request<{ working: string, data: { test: number } }>({
                channel: "testReplyDecoratorError",
                data: {"test": 1},
                options: {timeout: 10000}
            })
            result.should.not.be.ok;
        } catch (e) {
            e.message.should.be.eq("invalid decorator")
        }
    })

    it.only("should request reply events decorator", async () => {

        let provider = app.injector.get<PubSubProvider>("pubSubProvider")


        let result = await provider.request<{ working: string, data: { test: number } }>({
            channel: "testReplyDecorator",
            data: {"test": 1},
            options: {timeout: 10000}
        })
        result.working.should.be.eq(2)
        result.data.test.should.be.eq(1)
    })
});


