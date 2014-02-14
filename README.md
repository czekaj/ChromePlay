ChromePlay
==========
Google Chrome browser extension - allows sending YouTube videos to AppleTV via AirPlay

![ChromePlay logo](https://github.com/czekaj/ChromePlay/raw/master/icon.png "ChromePlay")

Usage
-----
- Click the extension icon while watching a video on youtube.com to send it to your AppleTV
- Right click a youtube.com link and select "AirPlay it!" to send it to your AppleTV

FAQ
---

- Q: *Isn't YouTube already ON AppleTV?*
- A: **Yes, but with this extension you can instantly send a video to AppleTV while browsing on your computer. There's no need to search for it on your AppleTV/iPhone/iPad.**

- Q: *I click the icon but nothing happens.*
- A: **Make sure your AppleTV hostname is configured properly on the Options page**
    - Look at Settings->General->Name of your AppleTV. 
    - Replace spaces with dashes (-)
    - add .local suffix
    - e.g. if your AppleTV is named "Office Apple TV" then the hostname will be: Office-Apple-TV.local

Installation
------------
Clone the repository (preferred) or extract the zip file from [here](https://github.com/czekaj/ChromePlay/archive/master.zip "https://github.com/czekaj/ChromePlay/archive/master.zip"). Install it by clicking "Load unpacked extension..." on Chrome Extensions page and point it to the extracted folder.

Updates
-------
To update the extension you can use Git pull or overwrite files (if extracted from .zip). I'm planning to create a package as well when it's stable enough.

Notes
-----
- Best quality MP4 video is chosen automatically
- You can change default AppleTV hostname on the Options page
- Google Chrome has to be running while watching video but the actual streaming is done exclusively by AppleTV. There's no need to keep the video page open.
- Tested with Google Chrome 33 beta on OSX Mavericks and Google Chrome 32 stable on Windows 7 x64.
