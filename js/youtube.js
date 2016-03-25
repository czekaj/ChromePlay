"use strict";
const parser = require("./parser");

function getIdFromUrl(url) {
  let videoId = url.split("v=")[1];
  const ampersandPosition = videoId.indexOf("&");
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }
  return videoId;
}

function getVideoInfo(videoId) {
  const protocol = "https://";
  const request = new XMLHttpRequest();
  const requesturl = `${protocol}www.youtube.com/get_video_info?&video_id=${videoId}`
    + "&eurl=http%3A%2F%2Fwww%2Eyoutube%2Ecom%2F&sts=1588";
  request.open("GET", requesturl, false);
  request.send(); // synchronous requests! don't tell mom

  if (request.status === 200) {
    const q = parser.parseQueryString(request.responseText);
    // if it has a token it's good enough
    if (q.token) {
      return q;
    }
  }
  // can't get video info
  return null;
}
function getVideoUrlObject(videoInfo, quality) {
  if (videoInfo.conn && videoInfo.conn.startsWith("rtmp")) return videoInfo.conn;
  else if (videoInfo.url_encoded_fmt_stream_map
    && videoInfo.url_encoded_fmt_stream_map.length > 1) {
    const urlData = [];
    const urlDataStrs = videoInfo.url_encoded_fmt_stream_map.split(",");
    const urlDataSortFunc = function (a, b) {
      return b.itag - a.itag;
    };
    const urlDataGetQuality = function (quality) {
      for (const i in urlData) {
        if ({}.hasOwnProperty.call(urlData, i)) {
          const urlInfo = urlData[i];
          if (urlInfo.quality === quality) {
            return urlInfo;
          }
        }
      }
      return urlData[0];
    };
    for (const i in urlDataStrs) {
      const urlInfo = parser.parseQueryString(urlDataStrs[i]);
      const fmt = parser.parseFlashVariables(urlDataStrs[i]);

      urlInfo.url = urlInfo.url.replace(/^https/, "http");

      if (urlInfo.sig) {
        urlInfo.url += "&signature=${urlInfo.sig}";
      }
      else
        if (fmt.s) {
          urlInfo.url += "&signature=" + parser.decodeSignature(fmt.s);
        }
      if (urlInfo.url && urlInfo.itag && urlInfo.type.lastIndexOf("video/mp4;", 0) === 0 // we want only MP4 streams
        && parseInt(urlInfo.itag) < 82 // we don't want 3D
      ) {
        urlData.push(urlInfo);
      }
    }
    urlData.sort(urlDataSortFunc);

    if (quality !== undefined && quality !== null) {
      if (quality === "best") {
        console.log("Sending video format " + urlData[0].type + " itag=" + urlData[0].itag + " to your AppleTV")
        return urlData[0];
      } else if (quality == "worst") return urlData[urlData.length - 1];
      else return urlData_closest_quality(quality);
    } else return urlData;
  } else console.log("Don\'t understand video info.");

  return null;
}
function getAirPlayUrl(url) {
  const videoId = getIdFromUrl(url);
  const videoInfo = getVideoInfo(videoId);
  const videoUrlObj = getVideoUrlObject(videoInfo, "best");

  let airplayUrl = videoUrlObj.url;
  if (/requiressl=yes/.test(airplayUrl)) {
    airplayUrl = airplayUrl.replace(/^http:/, "https:");
  }
  return airplayUrl;
}

module.exports = {
  getAirPlayUrl,
  getIdFromUrl,
  getVideoInfo,
};
