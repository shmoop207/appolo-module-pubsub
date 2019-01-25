"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_1 = require("appolo");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const Q = require("bluebird");
const handler_1 = require("./src/handler");
const index_1 = require("../index");
const publisher_1 = require("./src/publisher");
let should = require('chai').should();
chai.use(sinonChai);
describe("PubSub Spec", function () {
    let app;
    if (!process.env.REDIS) {
        throw new Error(`please define process.env.REDIS`);
    }
    beforeEach(async () => {
        app = appolo_1.createApp({ root: __dirname, environment: "production", port: 8181 });
        await app.module(new index_1.PubSubModule({ connection: process.env.REDIS }));
        await app.launch();
    });
    it("should publish events", async () => {
        await app.injector.get(publisher_1.Publisher).publish({ working: "bla" });
        await Q.delay(100);
        app.injector.get(handler_1.Handler).working.should.be.eq("bla");
        await app.reset();
    });
});
//# sourceMappingURL=spec.js.map