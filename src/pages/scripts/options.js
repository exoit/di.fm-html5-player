// Saves options to chrome.storage
function save_options() {
    var listenKey = document.getElementById('listen_key').value;
    if(!listenKey) {
        return;
    }
    chrome.storage.local.set(
        {
            "ListenKey":listenKey
        }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('save_info');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 750);
    });
}

// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    "ListenKey": "",
  }, function(items) {
    if(items.ListenKey) {
       document.getElementById('listen_key').value = items.ListenKey;
    }
  });
}

function openPlayer() {
    chrome.tabs.getCurrent(function (tab) {

      chrome.tabs.update(tab.id, {url: "pages/window.html"});
    });
}


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('back').addEventListener('click', openPlayer);