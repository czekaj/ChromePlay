const expect = require("chai").expect;
const parser = require("../js/parser");

describe("parseQueryStringTest", function () {
  it("should pass when url is properly parsed", function () {
    const parsedObj = parser.parseQueryString("?p=4&q=parse+query+string+test&type=Code");
    expect(parsedObj).to.have.property("p", "4");
    expect(parsedObj).to.have.property("q", "parse query string test");
    expect(parsedObj).to.have.property("type", "Code");
  });
});
