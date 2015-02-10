function notifyDirectMessages(loggedUser) {
    var directMessages = localStorage.getObjectGromLocalStorage('directMessagesList');
    localStorage.putObjectInLocalStorage('lastMessageSeenOnApp', directMessages[0]["id"]);
    var lastLogout = localStorage.getObjectGromLocalStorage('lastLogout');
    var lastUnloadPage = localStorage.getObjectGromLocalStorage('closeTab');
    logoutDate = new Date(lastLogout);
    closeTabDate = new Date(lastUnloadPage);
    var lastOut = logoutDate.getTime() < closeTabDate.getTime() ? closeTabDate : logoutDate;
    for (var i = 0; i < directMessages.length; i++) {
        if (directMessages[i]["sender_screen_name"] !== loggedUser["alias"]) {
            if (lastOut.getTime() < new Date(directMessages[i]["created_at"]).getTime()) {
                var txt = "ID " + directMessages[i]["id"] + " -- DATE " + directMessages[i]["created_at"] + " " +
                        directMessages[i]["sender"]["name"] +
                        "[@" + directMessages[i]["sender_screen_name"] + "] said " + directMessages[i]["text"] + " " + '<br/>';
                $("#directMessages").append(txt);
                    
            }
        }
    }
}
function prepareTweets(twitterService) {
    var mentions = localStorage.getObjectGromLocalStorage('mentionsList');
    localStorage.putObjectInLocalStorage('lastMention', mentions[0]["id_str"]);
    for (var i = 0; i < mentions.length; i++) {
        twitterService.displayTwitterFormat(mentions[i]["id_str"]);
    }
}
function notifyMentions() {
    var mentions = localStorage.getObjectGromLocalStorage('mentionsList');
    var lastLogout = localStorage.getObjectGromLocalStorage('lastLogout');
    var lastUnloadPage = localStorage.getObjectGromLocalStorage('closeTab');
    logoutDate = new Date(lastLogout);
    closeTabDate = new Date(lastUnloadPage);
    var lastOut = logoutDate.getTime() < closeTabDate.getTime() ? closeTabDate : logoutDate;

    for (var i = 0; i < mentions.length; i++) {
        if (lastOut.getTime() < new Date(mentions[i]["created_at"]).getTime()) {
            var format = localStorage.getObjectGromLocalStorage('format' + mentions[i]["id_str"]);
            localStorage.removeItem('format' + mentions[i]["id_str"]);
            $("#mentions").append(format["html"]);
        }

    }

}
