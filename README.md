ChromePlay
==========
Google Chrome extension - send YouTube, Vimeo and (almost) any HTML5 video to AppleTV via AirPlay

![ChromePlay logo](https://github.com/czekaj/ChromePlay/raw/master/icon.png "ChromePlay")

Features in v1.2.0
------------------
- YouTube AirPlay (click/right-click)
- Vimeo AirPlay (right-click)
- HTML5 video AirPlay (right-click)

Usage
-----
**YouTube**  
  
- Click the extension icon while watching a video on youtube.com to send it to your AppleTV  
  
![ChromePlay YouTube click](https://github.com/czekaj/ChromePlay/raw/master/images/chromeplay-click.png "ChromePlay YouTube click")  
  
  
- Right click a youtube.com link and select "AirPlay it!" to send it to your AppleTV  
  
![ChromePlay YouTube right-click](https://github.com/czekaj/ChromePlay/raw/master/images/chromeplay-right_click.png "ChromePlay YouTube right-click")  

**Vimeo & HTML5 videos**  
  
- Press Start & Pause in HTML5 player, right-click on the player and select "AirPlay it!" to send it to your AppleTV  
  
![ChromePlay HTML5 right-click](https://github.com/czekaj/ChromePlay/raw/master/images/chromeplay-right_click_html5.png "ChromePlay HTML5 right-click")  
  
  
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

![ChromePlay installation](https://github.com/czekaj/ChromePlay/raw/master/images/chromeplay-install.png "ChromePlay installation")

Updates
-------
To update the extension you can use Git pull or overwrite files (if extracted from .zip). I'm planning to create a package as well when it's stable enough.

Notes
-----
- Best quality YouTube MP4 video is chosen automatically
- HTML5 right-click AirPlaying supports only MP4 video format
- You can change default AppleTV hostname on the Options page
- Google Chrome has to be running while watching video but the actual streaming is done exclusively by AppleTV. There's no need to keep the video page open.
- Tested with Google Chrome 33 beta on OSX Mavericks and Google Chrome 32 stable on Windows 7 x64.
