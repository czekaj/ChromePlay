window.addEventListener ("load", tryToEnableChromePlay, false);

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