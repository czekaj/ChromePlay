// Saves options to localStorage.
function saveOptions(event) {
  event.preventDefault();
  
  function adjustHostname(hostname) {
    var adjustedHostname = hostname.replace(/\s+/g, '-');
    if (!adjustedHostname.endsWith(".local")) {
      adjustedHostname += ".local";
    }
    return adjustedHostname;
  }

  var adjustedHostname = adjustHostname(document.getElementById("hostname").value);
  localStorage["hostname"] = adjustedHostname;
  localStorage["play-position"] = document.getElementById("play-position-current").checked ? "current" : "0";

  document.getElementById("hostname").value = localStorage["hostname"];

  chrome.extension.getBackgroundPage().window.location.reload();

  // Show status to let user know options were saved.
  var status = document.getElementById("status");
  status.className = "alert alert-dismissible alert-success fade in"
  setTimeout(function() {
    status.className = "invisible";
  }, 2000);
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
  document.getElementById("hostname").value = localStorage["hostname"] || "apple-tv.local";

  var play_position_inputs = {
    "current": document.getElementById("play-position-current"),
    "0": document.getElementById("play-position-0")
  };
  play_position_inputs[localStorage["play-position"] || "current"].checked = true;
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);
