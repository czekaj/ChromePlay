
// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
	
		chrome.tabs.getSelected(null, function(tab) {
  		  var bgPage = chrome.extension.getBackgroundPage();
	      console.log("Starting AirPlaying...")
  		  bgPage.startPlaying(tab.url)
	   }
	);
		
});
