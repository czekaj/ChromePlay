// Saves options to localStorage.
function save_options() {
  localStorage["hostname"] = document.getElementById("hostname").value;
  localStorage["play-position"] = document.getElementById("play-position-current").checked ? "current" : "0";

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
  document.getElementById("hostname").value = localStorage["hostname"] || "apple-tv.local";

  var play_position_inputs = {
    "current": document.getElementById("play-position-current"),
    "0": document.getElementById("play-position-0")
  };
  play_position_inputs[localStorage["play-position"] || "current"].checked = true;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);