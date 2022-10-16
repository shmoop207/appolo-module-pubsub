"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@appolo/engine");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const handler_1 = require("./src/handler");
const index_1 = require("../index");
const utils_1 = require("@appolo/utils");
const publisher_1 = require("./src/publisher");
const mocha_1 = require("mocha");
let should = require('chai').should();
chai.use(sinonChai);
describe("PubSub Spec", function () {
    let app;
    if (!process.env.REDIS) {
        throw new Error(`please define process.env.REDIS`);
    }
    beforeEach(async () => {
        app = (0, engine_1.createApp)({ root: __dirname, environment: "production" });
        app.module.use(index_1.PubSubModule.for({ connection: process.env.REDIS }));
        await app.launch();
    });
    (0, mocha_1.afterEach)(async () => {
        await app.reset();
    });
    it("should publish events", async () => {
        await app.injector.get(publisher_1.Publisher).publish({ working: "bla" });
        await utils_1.Promises.delay(1000);
        app.injector.get(handler_1.Handler).working.should.be.eq("bla");
    });
    it("should request reply events", async () => {
        let provider = app.injector.get("pubSubProvider");
        let replyFn = (msg) => {
            msg.reply({ working: "yay", data: msg.data });
        };
        await provider.onReply({ channel: "testReply", fn: replyFn });
        let result = await provider.request({
            channel: "testReply",
            data: { "test": 1 },
            options: { timeout: 100000 }
        });
        result.working.should.be.eq("yay");
        result.data.test.should.be.eq(1);
    });
    it("should request reply events timeout", async () => {
        let provider = app.injector.get("pubSubProvider");
        let replyFn = (msg) => {
            msg.reply({ working: "yay", data: msg.data });
        };
        await provider.onReply({ channel: "testReply", fn: replyFn });
        try {
            let result = await provider.request({
                channel: "testReply",
                data: { "test": 1 },
                options: { timeout: 1 }
            });
            result.should.not.be.ok;
        }
        catch (e) {
            e.message.should.be.eq("timeout");
        }
    });
    it("should request reply events reject", async () => {
        let provider = app.injector.get("pubSubProvider");
        let replyFn = (msg) => {
            msg.reject(new index_1.RequestError("invalid test"));
        };
        await provider.onReply({ channel: "testReply", fn: replyFn });
        try {
            let result = await provider.request({
                channel: "testReply",
                data: { "test": 1 },
                options: { timeout: 10000 }
            });
            result.should.not.be.ok;
        }
        catch (e) {
            e.message.should.be.eq("invalid test");
        }
    });
    it("should request reply events decorator reject", async () => {
        let provider = app.injector.get("pubSubProvider");
        try {
            let result = await provider.request({
                channel: "testReplyDecoratorError",
                data: { "test": 1 },
                options: { timeout: 10000 }
            });
            result.should.not.be.ok;
        }
        catch (e) {
            e.message.should.be.eq("invalid decorator");
        }
    });
    it.only("should request reply events decorator", async () => {
        let provider = app.injector.get("pubSubProvider");
        let result = await provider.request({
            channel: "testReplyDecorator",
            data: { "test": 1 },
            options: { timeout: 10000 }
        });
        result.working.should.be.eq(2);
        result.data.test.should.be.eq(1);
    });
});
//# sourceMappingURL=spec.js.map