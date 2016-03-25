const youtube = require("./youtube");

const manifest = chrome.runtime.getManifest();
const storage = {
  hostname: localStorage.hostname || manifest.page_action.default_hostname,
  position: localStorage["play-position"] || "current",
};

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  type: "normal",
  title: "AirPlay it!",
  contexts: ["link", "video"],
  onclick: function (info, tab) {
    if (typeof info.linkUrl !== 'undefined') { // link clicked
      console.log("Right click - Sending url: " + info.linkUrl + " mediaType: " + info.mediaType)
      startPlaying(info.linkUrl, info.mediaType)
    } else if (info.mediaType === 'video') { // HTML5 video clicked
      console.log("Right click - Sending video: " + info.srcUrl)
      startPlaying(info.srcUrl, info.mediaType)
    }
  }
});

var playback_started = false; // to avoid terminating playback before video loads
var terminate_loop = false;

function airplay(url, position) {
  // Use position based on user options (or fallback to given position)
  position = storage.position === "current" ? position : 0;

  const xhr = new XMLHttpRequest();
  const xhr_stop = new XMLHttpRequest();
  const hostname = storage.hostname;
  const port = ":7000";
  if (/: \d + $ /.test(hostname)) port = "";

  // stop currently playing video
  xhr_stop.open("POST", "http://" + hostname + port + "/stop", true, "AirPlay", null);
  xhr_stop.send(null);

  xhr.open("POST", "http://" + hostname + port + "/play", true, "AirPlay", null);

  playback_started = false;
  terminate_loop = false;

  xhr.addEventListener("load", function () { // set timer to prevent playback from aborting
    var timer = setInterval(function () {
      var xhr = new XMLHttpRequest();
      var playback_info_keys_count = 0; // 0 something wrong; 2 ready to play; >2 playing
      xhr.open("GET", "http://" + hostname + port + "/playback-info", true, "AirPlay", null);
      xhr.addEventListener("load", function () {
        playback_info_keys_count = xhr.responseXML.getElementsByTagName("key")
          .length;
        console.log("playback: " + playback_started + "; keys: " + playback_info_keys_count)
        if (!playback_started && playback_info_keys_count > 2) { // if we're getting some actual playback info
          playback_started = true;
          console.log("setting playback_started = true")
          terminate_loop = false;
        }
        if (terminate_loop && playback_info_keys_count <= 2) { // playback terminated
          console.log("stopping loop & setting playback_started = false")
          clearInterval(timer);
          var xhr_stop = new XMLHttpRequest();
          xhr_stop.open("POST", "http://" + hostname + port + "/stop", true, "AirPlay", null);
          xhr_stop.send(null);
          playback_started = false;
        }
        if (playback_started && playback_info_keys_count == 2) { // playback stopped, AppleTV is "readyToPlay"
          console.log("sending /stop signal, setting playback_started = false")
          var xhr_stop = new XMLHttpRequest();
          xhr_stop.open("POST", "http://" + hostname + port + "/stop", true, "AirPlay", null);
          xhr_stop.send(null);
          playback_started = false;
          terminate_loop = true;
        }
      }, false);
      xhr.addEventListener("error", function () {
        clearInterval(timer);
      }, false);
      xhr.send(null);
    }, 5000);
  }, false);
  xhr.setRequestHeader("Content-Type", "text/parameters");
  xhr.send(`Content-Location: ${url}`
    + `\nStart-Position: ${position}\n`);
}

/**
 * Starts playing video from given position
 *
 * @param  {String} videoUrl       URL for the video
 * @param  {String} [contentType]  type of video
 * @param  {Number} [position]      starting position between 0 and 1
 */
function startPlaying(videoUrl, contentType, position) {
  let airplayUrl = videoUrl;
  contentType = typeof contentType === "undefined" || contentType !== "video" ? "youtube" : "video";
  position = position || 0;
  if (contentType === "youtube") {
    airplayUrl = youtube.getAirPlayUrl(videoUrl);
  }
  console.log("airplayUrl: " + airplayUrl);
  airplay(airplayUrl, position);
}

function onRequest(request, sender, sendResponse) {
  // Show the page action for the tab that the sender (content script)
  // was on.
  chrome.pageAction.show(sender.tab.id);
  // Return nothing to let the connection be cleaned up.
  sendResponse({});
}

// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);

chrome.pageAction.onClicked.addListener(function (tab) {
  console.log('Button clicked.');
  var video;
  chrome.tabs.sendMessage(tab.id, {
    action: "Html5Video"
  }, function (response) {
    console.log('Response on HTML5 compatibility received');
    video = response.Html5Video;
    if (typeof video === 'undefined' || /^http(s?):\/\/(www\.)?youtube/.test(tab.url)) {
      console.log('startPlaying YouTube');
      startPlaying(tab.url) // YouTube url
    } else {
      console.log('startPlaying HTML5', video);
      return startPlaying(video.url, 'video', video.position); // HTML5 video
    }
  });
});

// some websites use HTML5 video if viewed on iPad
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (info) {
    // Replace the User-Agent header
    var headers = info.requestHeaders;
    headers.forEach(function (header, i) {
      if (header.name.toLowerCase() == 'user-agent') {
        header.value = 'Mozilla/5.0 (iPad; CPU OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53'; // iPadify page to get HTML5 video
      }
    });
    return {
      requestHeaders: headers,
    };
  },
  // Request filter
  {
    // Modify the headers for these pages
    urls: [
      "http://www.xvideos.com/video*",
      "http://xhamster.com/movies/*",
    ],
    // In the main window and frames
    types: ["main_frame", "sub_frame"],
  }, ["blocking", "requestHeaders"]
);
