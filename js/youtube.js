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

function getVideoInfo(videoId, request, elType) {
  const protocol = "https://";
  if (!elType) {
    elType = "";
  }
  const requesturl = `${protocol}www.youtube.com/get_video_info?video_id=${videoId}${elType}`
    + "&eurl=http%3A%2F%2Fwww%2Eyoutube%2Ecom%2F&ps=default&eurl=&gl=US&hl=en&sts=";
  console.log("videoId: " + videoId + ", elType: " + elType  +  ", requesturl: " + requesturl);

  request.open("GET", requesturl, false);
  request.send(); // synchronous requests! don't tell mom

  if (request.status === 200) {
    const q = parser.parseQueryString(request.responseText);
    // if it has a token it's good enough
    if (q.token) {
      if (q.hlsvp) {
        console.log("HLS info found!");
      }
      return q;
    }
  }
  // can't get video info
  return null;
}
function replaceHttpsIfNeeded(videoUrlObj) {
  if (videoUrlObj && videoUrlObj.url && /requiressl=yes/.test(videoUrlObj.url)) {
    videoUrlObj.url = videoUrlObj.url.replace(/^http:/, "https:");
  }
  return videoUrlObj
}
function getVideoUrlObject(videoInfos, quality, ytPlayer) {
  //console.log("videoInfos: %j", videoInfos);
  let videoUrlObj = null;
  let urlData = [];
  const urlDataSortFunc = function (a, b) {
    return b.itag - a.itag;
  };

  for (const i in videoInfos) {
    const videoInfo = videoInfos[i];
    // RTMP protocol handling
    if (videoInfo.conn && videoInfo.conn.startsWith("rtmp")) {
      videoUrlObj = videoInfo.conn;
    }
    else {
      let formatMap = null;
      let is_hls = false;

      if (videoInfo.hlsvp != null) {
        formatMap = ytPlayer.args.hlsvp;
        urlData.push({
          url: videoInfo.hlsvp,
          itag: 9999,
        });
        console.log("hlsvp format map found in videoInfo");
        is_hls = true;
      }
      if (!is_hls && ytPlayer && ytPlayer.args && ytPlayer.args.hlsvp) {
        formatMap = ytPlayer.args.hlsvp;
        urlData.push({
          url: ytPlayer.args.hlsvp,
          itag: 9999,
        });
        console.log("hlsvp format map found in ytPlayer");
        is_hls = true;
      } else {
        formatMap = videoInfo.adaptive_fmts;
      }
      if (!formatMap || formatMap.length < 1) {
        if (videoInfo.url_encoded_fmt_stream_map
          && videoInfo.url_encoded_fmt_stream_map.length > 1) {
          formatMap = videoInfo.url_encoded_fmt_stream_map;
        }
      }
      if (formatMap && !is_hls) {
              const urlDataStrs = formatMap.split(",");
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
                if (is_hls || (urlInfo.url && urlInfo.itag
                  && urlInfo.type.lastIndexOf("video/mp4;", 0) === 0 // we want only MP4 streams
                  && parseInt(urlInfo.itag) != 82 // we don't want 3D
                  && parseInt(urlInfo.itag) != 83 // we don't want 3D
                  && parseInt(urlInfo.itag) != 84 // we don't want 3D
                  && parseInt(urlInfo.itag) != 85 // we don't want 3D
                  && parseInt(urlInfo.itag) != 160 // we don't want 144px video
                  )
                ){
                  urlData.push(urlInfo);
                }
              }
        } else if (!formatMap) {
          console.log("Don\'t understand video info.");
          videoUrlObj = null;
        }
      }
  }
  urlData.sort(urlDataSortFunc);

  console.log("urlData: %j", urlData);

  if (quality !== undefined && quality !== null) {
    if (quality === "best") {
      console.log("Sending video format " + urlData[0].type + " itag=" + urlData[0].itag + " to your AppleTV")
      videoUrlObj = urlData[0];
    } else if (quality == "worst") return urlData[urlData.length - 1];
    else videoUrlObj = urlData_closest_quality(quality);
  } else videoUrlObj = urlData;

    /*
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
    */
  urlData = [];
  return replaceHttpsIfNeeded(videoUrlObj);
}
function getAirPlayUrl(url, ytPlayer) {
  const videoId = getIdFromUrl(url);
  const videoInfos = [];
  videoInfos.push(getVideoInfo(videoId, new XMLHttpRequest()));
  const videoUrlObj = getVideoUrlObject(videoInfos, "best", ytPlayer);
  return videoUrlObj.url;
}

module.exports = {
  getAirPlayUrl,
  getIdFromUrl,
  getVideoInfo,
  getVideoUrlObject,
};
