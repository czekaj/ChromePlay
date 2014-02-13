// Saves options to localStorage.
function save_options() {
  var input = document.getElementById("hostname");
  var hostname = input.value;
  localStorage["hostname"] = hostname;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
  chrome.extension.getBackgroundPage().window.location.reload();
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var hostname = localStorage["hostname"];
  var input = document.getElementById("hostname");
  if (!hostname) {
	  input.value = "apple-tv.local";
  }
  else {
	  input.value = hostname;
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);