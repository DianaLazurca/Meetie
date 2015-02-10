function notifyDirectMessages(loggedUser) {
    var directMessages = localStorage.getObjectGromLocalStorage('directMessagesList');
    localStorage.putObjectInLocalStorage('lastMessageSeenOnApp', directMessages[0]["id"]);
    var lastLogout = localStorage.getObjectGromLocalStorage('lastLogout');
    var lastUnloadPage = localStorage.getObjectGromLocalStorage('closeTab');
    var logoutDate = new Date(lastLogout);
    var closeTabDate = new Date(lastUnloadPage);
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

function notifyDirectMessagesOnline(loggedUser) {
    var lastMessageID = localStorage.getObjectGromLocalStorage('lastMessageSeenOnApp');

    var twitterService = authorizeAndInitializeService().twitterService;
    twitterService.getUserDirectMessagesGreaterThanId(lastMessageID);

    window.setTimeout(function () {
        var newMessages = localStorage.getObjectGromLocalStorage('directMessagesListGreater');

        if (newMessages !== null && newMessages.length !== 0) {
            localStorage.putObjectInLocalStorage('lastMessageSeenOnApp', newMessages[0]["id"]);
            for (var i = 0; i < newMessages.length; i++) {
                if (newMessages[i]["sender_screen_name"] !== loggedUser["alias"]) {
                    var txt = "ID " + newMessages[i]["id"] + " -- DATE " + newMessages[i]["created_at"] + " " +
                            newMessages[i]["sender"]["name"] +
                            "[@" + newMessages[i]["sender_screen_name"] + "] said " + newMessages[i]["text"] + " " + '<br/>';
                    $("#directMessages").append(txt);
                }
            }
        }


    }, 2000);

}
function prepareTweets(twitterService) {
    var mentions = localStorage.getObjectGromLocalStorage('mentionsList');

    if (mentions !== null && mentions.length !== 0) {
        localStorage.putObjectInLocalStorage('lastMention', mentions[0]["id_str"]);
        for (var i = 0; i < mentions.length; i++) {
            twitterService.displayTwitterFormat(mentions[i]["id_str"]);
        }
    }

}

function prepareTweetsOnline(twitterService) {
    var lastMentionFromUser = localStorage.getObjectGromLocalStorage('lastMention');

    twitterService.getUserMentionsGreaterThanId(lastMentionFromUser);

    window.setTimeout(function () {
        var newMentions = localStorage.getObjectGromLocalStorage('mentionsListGreater');
        if (newMentions !== null && newMentions.length !== 0) {
            localStorage.putObjectInLocalStorage('lastMention', newMentions[0]["id_str"]);
            for (var i = 0; i < newMentions.length; i++) {
                twitterService.displayTwitterFormat(newMentions[i]["id_str"]);
            }
        }
    }, 2000);

}
function notifyMentions() {
    var mentions = localStorage.getObjectGromLocalStorage('mentionsList');
    var lastLogout = localStorage.getObjectGromLocalStorage('lastLogout');
    var lastUnloadPage = localStorage.getObjectGromLocalStorage('closeTab');
    var logoutDate = new Date(lastLogout);
    var closeTabDate = new Date(lastUnloadPage);
    var lastOut = logoutDate.getTime() < closeTabDate.getTime() ? closeTabDate : logoutDate;

    for (var i = 0; i < mentions.length; i++) {
        if (lastOut.getTime() < new Date(mentions[i]["created_at"]).getTime()) {
            var format = localStorage.getObjectGromLocalStorage('format' + mentions[i]["id_str"]);
            localStorage.removeItem('format' + mentions[i]["id_str"]);
            $("#mentions").append(format["html"]);
        }

    }

}

function notifyMentionsOnline() {

    window.setTimeout(function () {
        var newMentions = localStorage.getObjectGromLocalStorage('mentionsListGreater');
        if (newMentions !== null && newMentions.length !== 0) {
            for (var i = 0; i < newMentions.length; i++) {
                var format = localStorage.getObjectGromLocalStorage('format'+newMentions[i]["id_str"]);
                localStorage.removeItem('format' + newMentions[i]["id_str"]);
                $("#mentions").append(format["html"]);
            }
        }

    }, 2000);




}

function setUpdateInterval(notifyDirectMessagesOnline, loggedUser, prepareTweetsOnline, twitterService, notifyMentionsOnline) {
    setInterval(function () {
        notifyDirectMessagesOnline(loggedUser);
        prepareTweetsOnline(twitterService);
        window.setTimeout(function () {
             notifyMentionsOnline();
        }, 2000);
       
    }, 60000);
}
