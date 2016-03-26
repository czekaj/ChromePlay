/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const youtube = __webpack_require__(1);
	
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const parser = __webpack_require__(2);
	
	function getIdFromUrl(url) {
	  let videoId = url.split("v=")[1];
	  const ampersandPosition = videoId.indexOf("&");
	  if (ampersandPosition !== -1) {
	    videoId = videoId.substring(0, ampersandPosition);
	  }
	  return videoId;
	}
	
	function getVideoInfo(videoId, request) {
	  const protocol = "https://";
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
	  let videoUrlObj = null;
	  if (videoInfo.conn && videoInfo.conn.startsWith("rtmp"))
	    videoUrlObj = videoInfo.conn;
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
	        videoUrlObj = urlData[0];
	      } else if (quality == "worst") return urlData[urlData.length - 1];
	      else videoUrlObj = urlData_closest_quality(quality);
	    } else videoUrlObj = urlData;
	  } else {
	    console.log("Don\'t understand video info.");
	    videoUrlObj = null;
	  }
	  if (videoUrlObj && videoUrlObj.url && /requiressl=yes/.test(videoUrlObj.url)) {
	    videoUrlObj.url = videoUrlObj.url.replace(/^http:/, "https:");
	  }
	  return videoUrlObj;
	}
	function getAirPlayUrl(url) {
	  const videoId = getIdFromUrl(url);
	  const videoInfo = getVideoInfo(videoId, new XMLHttpRequest());
	  const videoUrlObj = getVideoUrlObject(videoInfo, "best");
	
	  let airplayUrl = videoUrlObj.url;
	  return airplayUrl;
	}
	
	module.exports = {
	  getAirPlayUrl,
	  getIdFromUrl,
	  getVideoInfo,
	  getVideoUrlObject,
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	exports.parseWithRegExp = function (text, regex, processValue) { // regex needs 'g' flag
	  const obj = {};
	  if (!text) return obj;
	  if (processValue === undefined) {
	    processValue = function (s) {
	      return s;
	    };
	  }
	  let match;
	  while ((match = regex.exec(text))) {
	    obj[match[1]] = processValue(match[2]);
	  }
	  return obj;
	};
	
	// decode youtube video signature
	exports.decodeSignature = function (signature) {
	  let s = signature.split("");
	  s = s.slice(2);
	  s = s.reverse();
	  s = s.slice(3);
	  const t = s[0];
	  s[0] = s[19 % s.length];
	  s[19] = t;
	  s = s.reverse();
	  return s.join("");
	};
	// reads and parses a query string
	exports.parseQueryString = function (qs) {
	  const qsSplit = qs.split("+").join(" ");
	  const re = /[?&]?([^=]+)=([^&]*)/g;
	  const params = {};
	  let tokens;
	  while ((tokens = re.exec(qsSplit))) {
	    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	  }
	  return params;
	};
	
	exports.parseFlashVariables = function (s) {
	  return this.parseWithRegExp(s, /([^&=]*)=([^&]*)/g);
	};


/***/ }
/******/ ]);
//# sourceMappingURL=background.bundle.js.map