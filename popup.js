
// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
	
		chrome.tabs.getSelected(null, function(tab) {
		  var video_id = tab.url.split('v=')[1];
		  var ampersandPosition = video_id.indexOf('&');
		  if(ampersandPosition != -1) {
		    video_id = video_id.substring(0, ampersandPosition);
 		}

  		  var bgPage = chrome.extension.getBackgroundPage();
	      console.log("starting playing...")
  		  bgPage.startPlaying(video_id)
	   }
	);
		
});
