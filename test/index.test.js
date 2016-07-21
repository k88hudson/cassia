"use strict";

const Cassia = require("../index");
const assert = require("chai").assert;

describe("test", () => {
  it("should create an instance", () => {
    const ctx = {};
    const cassia = new Cassia(ctx);
    cassia.setup();
    assert.ok(ctx.describe);

    ctx.describe("chocolate", () => {
      ctx.beforeEach(() => {
        console.log("getting chocolate...");
      });
      ctx.it("should do stuff", () => {
        assert.equal(1, 2);
      });
      ctx.it("should pass", () => {
        assert.equal(1, 1);
      });
      ctx.describe("blue", () => {
        ctx.it("bar", () => {
          assert.equal(1, 1);
        });
      });
    });
    cassia.run();
  });
});

describe("sample", () => {
  it("level A", () => {
    assert.ok("1");
  });
  describe("sample inner", () => {
    it("level B", () => {

    });
  });
});
