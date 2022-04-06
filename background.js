'use strict'    
{
    var all_titles = [];
    chrome.runtime.onMessage.addListener(
        async function (request, sender, sendResponse) {
            switch(request.type) {
                case "add":
                    all_titles = all_titles.concat(request.value);
                    all_titles = Array.from(new Set(all_titles));
                    break;
                case "load":
                    break;
                case "change":
                    all_titles = request.value;
                default:
                    break;
            }
            console.log(all_titles);
            sendResponse({value: all_titles});
        }
    );
}