"use strict";

const expect = require("chai").expect;
const parser = require("../js/parser");

describe("parser", function () {
  it("should pass when query string is properly parsed", function () {
    const parsedObj = parser.parseQueryString("?p=4&q=parse+query+string+test&type=Code");
    expect(parsedObj).to.have.property("p", "4");
    expect(parsedObj).to.have.property("q", "parse query string test");
    expect(parsedObj).to.have.property("type", "Code");
  });
  it("should return empty object when no text is provided", function () {
    expect(parser.parseWithRegExp(null, "",null)).to.be.empty;
  });
});
