window.addEventListener ("load", tryToEnableChromePlay, false);
window.addEventListener ("DOMActivate", tryToEnableChromePlay, false);

function checkForHtml5VideoUrl() {
	if (document.getElementsByTagName('video').length > 0) {
		var src = document.getElementsByTagName('video')[0].src
		if (!src) {
			src = document.getElementsByTagName('source') ? document.getElementsByTagName('source')[0].src : null
		}
		return src;
	}
	else {
		var noscripts = document.getElementsByTagName('noscript');
		for (var i=0; i<noscripts.length; i++) {
		    var el = document.createElement("div");
		    el.innerHTML = noscripts[i].innerHTML;
			el.innerHTML = el.childNodes[0].nodeValue
			if (el.getElementsByTagName('video').length > 0) {
				var src = el.getElementsByTagName('video')[0].src
				if (!src) {
					src = el.getElementsByTagName('source').length >0 ? el.getElementsByTagName('source')[0].src : null
				}
				return src;
			}
		}
	}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "Html5VideoUrl") {
		console.log('Request message getHtml5VideoUrl received');
        sendResponse({Html5VideoUrl: checkForHtml5VideoUrl()});
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
			} else if (checkForHtml5VideoUrl()) { // we're having HTML5 video
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