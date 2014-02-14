document.addEventListener('DOMContentLoaded', function () {
	
		chrome.tabs.getSelected(null, function(tab) {
  		  var bgPage = chrome.extension.getBackgroundPage();
		  
	      console.log("Starting AirPlaying...")
  		  bgPage.startPlaying(tab.url)
	   }
	);
		
});
