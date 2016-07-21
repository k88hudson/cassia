"use strict";

const EventEmitter = require("events");

class Test {
  constructor(name, test) {
    this.name = name;
    this.test = test;
  }
}

const flowFunctions = [
  "beforeEach",
  "before",
  "afterEach",
  "after"
];

class Suite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.suites = [];
    flowFunctions.forEach(type => {
      this[type] = [];
    });
  }
  addTest(test) {
    this.tests.push(test);
  }
  addFlowFunction(type, fn) {
    if (!this[type]) throw new Error("Tried to add a flow function that doesn't exist: " + type);
    this[type].push(fn);
  }
}

class Reporter {
  constructor(runner) {
    let indents = 2;

    function indent() {
      return Array(indents).join('   ');
    }

    runner.on("start", () => {
      console.log("Starting Tests...");
    });
    runner.on("suite start", name => {
      console.log(indent() + `(${name}:`);
      indents++;
    });
    runner.on("suite end", name => {
      indents--;
      console.log(indent() + `)`);

    });
    runner.on("pass", name => {
      console.log(indent() + `pass: ${name}`);
    });
    runner.on("fail", (name, error) => {
      console.log(indent() + `fail: ${name} =>  ${error}`);
    });
    runner.on("end", () => {
      console.log("Tests Done.");
    });
  }
}

class Cassia extends EventEmitter {
  constructor(context) {
    super();
    this.context = context || global;
    this.currentSuite = null;
    this.suites = [];
    this.reporter = new Reporter(this);
  }
  setup() {
    this.context.describe = (name, block) => {
      const suite = new Suite(name);
      // TODO: use a set
      if (this.currentSuite) {
        this.currentSuite.suites.push(suite);
      } else {
        this.suites.push(suite);
      }
      this.currentSuite = suite;
      block();
      this.currentSuite = null;
    };
    this.context.it = (name, test) => {
      this.currentSuite.addTest(new Test(name, test));
    };
    flowFunctions.forEach(type => {
      this.context[type] = fn => {
        this.currentSuite.addFlowFunction(type, fn);
      };
    });
  }
  runSuites(suites) {
    suites.forEach(suite => {
      this.emit("suite start", suite.name);
      suite.before.forEach(fn => fn());
      suite.tests.forEach(test => {
        try {
          suite.beforeEach.forEach(fn => fn());
          test.test();
          suite.afterEach.forEach(fn => fn());
          this.emit("pass", test.name);
        } catch (error) {
          this.emit("fail", test.name, error);
        }
      });
      this.runSuites(suite.suites);
      suite.after.forEach(fn => fn());
      this.emit("suite end", suite.name);
    });
  }
  run() {
    this.emit("start");
    this.runSuites(this.suites);
    this.emit("end");
  }
}

module.exports = Cassia
