window.addEventListener ("load", tryToEnableChromePlay, false);
window.addEventListener ("DOMActivate", tryToEnableChromePlay, false);

/**
 * Tries to find video src in given document.
 * Uses window.document by default.
 *
 * @param  {Object} [document] document to search in
 * @return {Object}            object with video url and position
 */
function checkForHtml5Video(document) {
	var ret = { url: null, position: 0 };

	// Fallback to the window.document if no document is given
	document = document || window.document;

	var videos = document.getElementsByTagName('video');
	for (var i=0; i<videos.length; i++) {
		var video = videos[i];
		ret.url = video.currentSrc;
		ret.position = video.currentTime/video.duration;
		if (ret.url) return ret;
	}

	var iframes = document.getElementsByTagName('iframe');
	for (var i=0; i<iframes.length; i++) {
		// Search within same origin iframes because we can't access other domains
		if (iframes[i].src.indexOf(window.document.domain) !== -1) {
			// Recursive search within iframe if it contains any video
			iframeDocument = iframes[i].contentDocument;
			if (iframeDocument) {
				ret = checkForHtml5Video(iframeDocument);
				if (ret.url) return ret;
			}
		}
	}

	var noscripts = document.getElementsByTagName('noscript');
	for (var i=0; i<noscripts.length; i++) {
	    var el = document.createElement("div");
	    el.innerHTML = noscripts[i].innerHTML;
		el.innerHTML = el.childNodes[0].nodeValue
		if (el.getElementsByTagName('video').length > 0) {
			ret = checkForHtml5Video(el);
			if (ret.url) return ret;
		}
	}

	return ret;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "Html5Video") {
		console.log('Request message getHtml5Video received');
        sendResponse({Html5Video: checkForHtml5Video()});
		return true;
	}
  });

function tryToEnableChromePlay(evt) {

	var jsInitChecktimer = setInterval (checkForJS_Finish, 111);

	function checkForJS_Finish () {
	    if (!/vimeo.com/.test(document.URL) || document.getElementsByClassName('target').length > 0) {
	        clearInterval (jsInitChecktimer);
	        enableChromePlay();
	    }
		function enableChromePlay() {
			if (/^https?:\/\/(?:www\.)?youtube.com\/watch\?(?=[^?]*v=\w+)(?:[^\s?]+)?$/.test(document.URL)) {
				chrome.extension.sendRequest({}, function(response) {}); // show the icon in omnibox
			} else if (checkForHtml5Video().url) { // we're having HTML5 video
				chrome.extension.sendRequest({}, function(response) {}); // show the icon in omnibox
		   	} else if (/vimeo.com/.test(document.URL)) {
				// some magic to enable right-clicking on Vimeo videos
				var elements = document.getElementsByClassName('target');
				for(var i=0; i<elements.length; i++) {
					elements[i].style.zIndex = "-1";
			    }
				elements = document.getElementsByClassName('video');
				for(var i=0; i<elements.length; i++) {
					elements[i].style.zIndex = "1000";
			        elements[i].className = 'video_unlocked_by_chromeplay';
			    }
				elements = document.getElementsByClassName('video cover');
				for(var i=0; i<elements.length; i++) {
			        elements[i].className = 'video_unlocked_by_chromeplay cover';
			    }
			}
			else {
			  // No match was found.
			}
		}
	}
}
