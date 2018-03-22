/*
This file is loaded in mocha.opts and is used only for
loading appropriate modules into global scope
when running tests to reduce boilerplate
*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

chai.use(chaiAsPromised);

global.expect = chai.expect;
global.sinon = sinon;
