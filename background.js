// reads and parses a query string
function readQueryString(qs)
{
	qs = qs.split("+").join(" ");
	var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;
	while(tokens = re.exec(qs)) params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	return params;
}

function getYouTubeVideoInfo(video_id)
{
	var prefix = "https://"
	//var el_types = ["&el=embedded", "&el=detailpage", "&el=vevo", ""];
//	for(var i in el_types)
//	{
		var request = new XMLHttpRequest();
		var requesturl = prefix+"www.youtube.com/get_video_info?&video_id=" + video_id //+ el_types[i] 
		+"&eurl=http%3A%2F%2Fwww%2Eyoutube%2Ecom%2F&sts=1588";
		request.open('GET', requesturl, false);
		request.send(); // synchronous requests! don't tell mom

		if(request.status === 200)
		{
			var q = readQueryString(request.responseText);

			// if it has a token it's good enough
			if(q.token)
				return q;
		}
//	}

	// can't get vidya info
	return null;
}

function getYouTubeVideoUrl(video_info, quality)
{
	if(video_info.conn && video_info.conn.startsWith('rtmp')) return video_info.conn;
	else if(video_info.url_encoded_fmt_stream_map && video_info.url_encoded_fmt_stream_map.length > 1)
	{
		var url_data = [];
		var url_data_strs = video_info.url_encoded_fmt_stream_map.split(',');
		var url_data_sort_func = (function(a,b) { return b.itag - a.itag; });
		var url_data_get_quality = (function(quality) {
			for(var i in url_data)
			{
				var url_info = url_data[i];
				if(url_info.quality == quality)
					return url_info;
			}
			return url_data[0];
		});
		for(var i in url_data_strs)
		{
			var url_info = readQueryString(url_data_strs[i]);
			fmt = parseFlashVariables(url_data_strs[i]);
			
			url_info.url = url_info.url.replace(/^https/, "http");
			
			if(url_info.sig)
				url_info.url += '&signature=' + url_info.sig;
			else if(fmt.s) 
				url_info.url += "&signature=" + decodeSignature(fmt.s);

			if(url_info.url && url_info.itag && url_info.type.lastIndexOf("video/mp4;",0) === 0)
				url_data.push(url_info);
		}
		url_data.sort(url_data_sort_func);

		if(quality != undefined && quality != null)
		{
			if(quality == "best") return url_data[0];
			else if(quality == "worst") return url_data[url_data.length - 1];
			else return url_data_closest_quality(quality);
		}
		else return url_data;
	}
	else console.log("Don't understand video info.");

	return;
}

function decodeSignature(s) {
	s = s.split("");
	s = s.slice(2);
	s = s.reverse();
	s = s.slice(3);
	var t = s[0];
	s[0] = s[19%s.length];
	s[19] = t;
	s = s.reverse();
	return s.join("");
}

function parseWithRegExp(text, regex, processValue) { // regex needs 'g' flag
	var obj = {};
	if(!text) return obj;
	if(processValue === undefined) processValue = function(s) {return s;};
	var match;
	while(match = regex.exec(text)) {
		obj[match[1]] = processValue(match[2]);
	}
	return obj;
}
function parseFlashVariables(s) {return parseWithRegExp(s, /([^&=]*)=([^&]*)/g);}

chrome.contextMenus.create({
    "type":"normal", 
    "title":"AirPlay it!", 
    "contexts":["link"], 
    "onclick": function (info, tab) { 
		startPlaying(info.linkUrl)
    } 
});


function airplay(url, position) { 
    var xhr = new XMLHttpRequest(); 
    var port = ":7000"; 
    if(/: \d + $ / .test("apple-tv.local")) port = "";
    xhr.open("POST", "http://" + "apple-tv.local" + port + "/play", true, "AirPlay", null);
    xhr.addEventListener("load", function() { // Set timer to prevent playback from aborting
    var timer = setInterval(function() {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "http://" + "apple-tv.local" +
                port + "/playback-info", true, "AirPlay", null);
            xhr.addEventListener("load", function() {
                    if (xhr.responseXML.getElementsByTagName("key").length <= 2) // || xhr.responseXML.getElementsByTagName("key")[0].innerHTML == "readyToPlay") 
					{ // playback terminated 
                        clearInterval(timer);
						var xhr_stop = new XMLHttpRequest();
						 xhr_stop.open("POST", "http://" + "apple-tv.local" + port + "/stop", true, "AirPlay", null);
						 xhr_stop.send(null);
					} }, false); 
                        xhr.addEventListener("error", function() {clearInterval(timer);}, false);
                        xhr.send(null);
                    }, 5000);
            }, false); 
            xhr.setRequestHeader("Content-Type", "text/parameters"); xhr.send("Content-Location: " + url +
            "\nStart-Position: " + position + "\n");
    }
	function startPlaying(youtube_link)
	{
	  var video_id = youtube_link.split('v=')[1];
	  var ampersandPosition = video_id.indexOf('&');
	  if(ampersandPosition != -1) {
	    video_id = video_id.substring(0, ampersandPosition);
	   }
		
	  	var video_info = getYouTubeVideoInfo(video_id);
	  	var video_url = getYouTubeVideoUrl(video_info, "best");
	
	  	airplay(video_url.url,0);		
	}

	