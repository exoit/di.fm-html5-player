function openOptions() {
    chrome.tabs.getCurrent(function (tab) {

      chrome.tabs.update(tab.id, {url: "pages/options.html"});
    });
}

function fetchStreams() {

    chrome.storage.local.get({
    "ListenKey": "",
    }, function(items) {
        if(items.ListenKey) {
            fetchChannels("http://listen.di.fm/premium_high?"+items.ListenKey);
        } else {
            fetchChannels("http://listen.di.fm/public3");
        }
    });

}

function fetchChannels(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        parseChannels(xhr.responseText);
      }
    }
    xhr.send();
}

function parseChannels(channels_json) {
    var channels = JSON.parse(channels_json);
    channels.sort(compareChannels);
    clearChannelSelect();
    resetStreamSelect();
    var chSelect = document.getElementById('channels');
    var option = document.createElement("option");
        option.text = "Please select a channel";
    chSelect.add(option);
    channels.forEach(function(channel) {
        var option = document.createElement("option");
        option.text = channel.name;
        option.setAttribute('url', channel.playlist);
        chSelect.add(option);
    });
    chSelect.removeAttribute("disabled");
    chSelect.onchange = channelSelected;
}

function clearChannelSelect() {
 var chSelect = document.getElementById('channels');
    while (chSelect.firstChild) {
    chSelect.removeChild(chSelect.firstChild);
    }
}

function clearStreamSelect() {
    var sSelect = document.getElementById('streams');
    while (sSelect.firstChild) {
    sSelect.removeChild(sSelect.firstChild);
    }
}

function resetStreamSelect() {
    var sSelect = document.getElementById('streams');
    while (sSelect.firstChild) {
    sSelect.removeChild(sSelect.firstChild);
    }
    var option = document.createElement("option");
    option.text = "No streams found";
    sSelect.add(option);
    sSelect.setAttribute("disabled","disabled");
}

function channelSelected() {
    var chSelect = document.getElementById('channels');
    if(chSelect.selectedIndex == 0) {
        resetStreamSelect();
        disableButton(true);
    } else {
        var channel = chSelect.options[chSelect.selectedIndex];
        fetchPlayList(channel.getAttribute('url'));
    }
}

function fetchPlayList(url) {
     var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        parseStreams(xhr.responseText);
      }
    }
    xhr.send();
}

function parseStreams(streams_pls) {
    var lines = streams_pls.split('\n');
    var streams = [];
    for(var i = 0; i < lines.length;i++){
        if(/^File[0-9]/.test(lines[i])) {
            var file = lines[i].split('=');
            streams.push(file[1]);
        }
    }
    streams.sort();
    if(streams.length < 1) {
        return;
    }
    clearStreamSelect();
    var sSelect = document.getElementById('streams');
        var option = document.createElement("option");
        option.text = "Please select a stream";
        sSelect.add(option);
    var num=0;
    streams.forEach(function(stream_url) {
        var option = document.createElement("option");
        option.text = "Stream #" + num++;
        option.setAttribute('stream_url', stream_url);
        sSelect.add(option);
    });
    sSelect.removeAttribute("disabled");
    sSelect.onchange = streamSelected;
}

function streamSelected() {
     var sSelect = document.getElementById('streams');
     var loadButton = document.getElementById('load');
     console.log(sSelect.selectedIndex);
     if(sSelect.selectedIndex == 0) {
        disableButton(true);
     } else {
        disableButton(false);
     }
}

function disableButton(disable) {
    var loadButton = document.getElementById('load');
    if(disable) {
        loadButton.setAttribute("disabled", "disabled");
    } else {
        loadButton.removeAttribute("disabled");
    }
}

function loadStream() {
    chrome.storage.local.get({
    "ListenKey": "",
    }, function(items) {
        var sSelect = document.getElementById('streams');
        var chSelect = document.getElementById('channels');
        var stream_url = sSelect.options[sSelect.selectedIndex].getAttribute('stream_url');
        if(/(prem[0-9].di.fm)/.test(stream_url)) {
            console.log("PREM");
            stream_url += "?" + items.ListenKey;
        }
        console.log(stream_url);
        var player_content = document.getElementById('player_content');
        while (player_content.firstChild) {
            player_content.removeChild(player_content.firstChild);
        }
        var playing = document.createElement("h4");
        playing.setAttribute("class","playing");
        playing.innerText = "Playing: " + chSelect.options[chSelect.selectedIndex].value + " - " + sSelect.options[sSelect.selectedIndex].value;
        var audio = document.createElement("audio");
        audio.setAttribute("controls","controls");
        audio.setAttribute("autoplay","autoplay");
        var source = document.createElement("source");
        source.setAttribute("src",stream_url);
        source.setAttribute("type", "audio/mpeg");
        audio.appendChild(source);
        player_content.appendChild(playing);
        player_content.appendChild(audio);
    });
}

function compareChannels(a,b) {
  if (a.name < b.name)
     return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

document.getElementById('options').addEventListener('click', openOptions);
document.getElementById('load').addEventListener('click', loadStream);

fetchStreams();