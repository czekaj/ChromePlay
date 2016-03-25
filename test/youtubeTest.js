const expect = require("chai").expect;
const youtube = require("../js/youtube");

describe("youtube module test", function () {
  it("should pass when video ID can be extracted from url", function () {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const videoId = youtube.getIdFromUrl(url);
    expect(videoId).to.equal("dQw4w9WgXcQ");
  });
  it("should pass when videoInfo structure is valid", function () {
    const videoId = "dQw4w9WgXcQ";
    const videoInfo = youtube.getVideoInfo(videoId);
    expect(videoInfo).to.no.be.null;
  });
});
