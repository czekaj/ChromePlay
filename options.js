// Saves options to localStorage.
function saveOptions(event) {
  event.preventDefault();

  localStorage.hostname = document.getElementById("hostname").value;
  localStorage["play-position"] = document.getElementById("play-position-current")
    .checked ? "current" : "0";

  chrome.extension.getBackgroundPage().window.location.reload();

  // Show status to let user know options were saved.
  const status = document.getElementById("status");
  status.className = "alert alert-dismissible alert-success fade in";
  setTimeout(function () {
    status.className = "invisible";
  }, 2000);
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
  document.getElementById("hostname").value = localStorage.hostname || "apple-tv.local";
  const playPositionInputs = {
    current: document.getElementById("play-position-current"),
    0: document.getElementById("play-position-0"),
  };
  playPositionInputs[localStorage["play-position"] || "current"].checked = true;
}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
