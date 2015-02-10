
$(document).ready(function () {
    var twitter = authorizeAndInitializeService().twitter;
    var googlePlus = authorizeAndInitializeService().google_plus;
    if (twitter !== false) {
        localStorage.putObjectInLocalStorage('timeIOpenedBrowser', getCurrentDateTime());
        window.setTimeout(function () {
            var friendsList = localStorage.getObjectGromLocalStorage('friendsList');
            var followersList = localStorage.getObjectGromLocalStorage('followersList');
            var loggedUser = localStorage.getObjectGromLocalStorage('loggedinUser');
            parseList(friendsList);
            parseList(followersList);
            var user = initializeUser(loggedUser["id"], loggedUser["screen_name"],
                    loggedUser["name"], loggedUser["alias"],
                    loggedUser["avatar"], friendsList, followersList);

//            $("#username").append($("<img src='" + user.getPicture() + "' alt='profile image' />"));
            $("#username").append($("<b>" + user.getScreenName() + "</b>"));
            $("#username").append($("<b class = 'caret'></b>"));


            $("#image").attr("src", user.getPicture());
            var twitterService = authorizeAndInitializeService().twitterService;
            prepareTweets(twitterService);
            notifyDirectMessages(loggedUser);
            window.setTimeout(function () {
                notifyMentions();
            }, 2000);
        }, 2000);
        setUpdateInterval(notifyDirectMessagesOnline, localStorage.getObjectGromLocalStorage('loggedinUser'), prepareTweetsOnline,
                authorizeAndInitializeService().twitterService, notifyMentionsOnline);
    } else {
        if (googlePlus !== false) {
            $("#name").append('Sunt o smechera si m-am logat cu Google PLus');
        }

    }
    $("#directMessagesIcon").click(function (ev) {
        ev.preventDefault();

        var directMessages = localStorage.getObjectGromLocalStorage('directMessagesList');
        var newMessages = localStorage.getObjectGromLocalStorage('directMessagesListGreater');
        $("#circle").text("");
        if (newMessages !== null && newMessages.length !== 0) {
            localStorage.putObjectInLocalStorage('lastMessageSeenOnApp', newMessages[0]["id"]);
        } else if (directMessages !== null && directMessages.length !== 0) {
            localStorage.putObjectInLocalStorage('lastMessageSeenOnApp', directMessages[0]["id"]);
        }
    });
});
$("#logoutButton").click(function () {

    var twitter = authorizeAndInitializeService().twitter;
    if (twitter !== false) {
        var twitterService = authorizeAndInitializeService().twitterService;
        twitterService.logoutTwitter();
    } else {
        var googleService = authorizeAndInitializeService().googleService;
        googleService.logoutGoogle();
    }

});

$(window).unload(function () {
    localStorage.putObjectInLocalStorage('closeTab', getCurrentDateTime());
});

function notifyDirectMessages(loggedUser) {
    var directMessages = localStorage.getObjectGromLocalStorage('directMessagesList');
    var lastLogout = localStorage.getObjectGromLocalStorage('lastLogout');
    var lastUnloadPage = localStorage.getObjectGromLocalStorage('closeTab');
    var logoutDate = new Date(lastLogout);
    var closeTabDate = new Date(lastUnloadPage);
    var lastOut = logoutDate.getTime() < closeTabDate.getTime() ? closeTabDate : logoutDate;

    if (directMessages !== null && directMessages.length !== 0) {
        localStorage.putObjectInLocalStorage('lastMessageSeenOnApp', directMessages[0]["id"]);
        for (var i = directMessages.length - 1; i >= 0; i--) {
            if (directMessages[i]["sender_screen_name"] !== loggedUser["alias"]) {
                if (lastOut.getTime() < new Date(directMessages[i]["created_at"]).getTime()) {
                    $("#directMessages").prepend(getRenderedMessage(directMessages[i]));
                    if ($("#circle").text() === "") {
                        $("#circle").text("1");
                    } else {
                        var nr = parseInt($("#circle").text());
                        var b = nr + 1;
                        $("#circle").text(b);
                    }
                }
            }
        }
    }

}



function getRenderedMessage(directMessage) {
    var message = $("<li class='message-preview'></li>");
    var messageLink = $("<a href = " + "#" + "</a>");
    var messageMedia = $("<div class='media' />");
    var messageSpan = $("<span class='pull-left'></span>");
    var messageImage = $("<img class='media-object' src='" + directMessage["sender"]["profile_image_url"] + "' />");
    var messageBody = $("<div class='media-body' />");
    var messageHeader = $("<h5 class='media-heading'></h5>");
    $(messageHeader).append($("<strong>" + directMessage["sender"]["name"] + "[@"
            + directMessage["sender_screen_name"] + "]</strong>"));

    var dateParagraph = $("<p class='small text-muted'></p>");
    $(dateParagraph).append($("<i class='fa fa-clock-o'></i>"));
    $(dateParagraph).append(directMessage["created_at"]);

    $(messageBody).append(messageHeader);
    $(messageBody).append(dateParagraph);
    $(messageBody).append($("<p>" + directMessage["text"] + "</p>"));

    $(messageSpan).append(messageImage);

    $(messageMedia).append(messageSpan);
    $(messageMedia).append(messageBody);

    $(messageLink).append(messageMedia);

    $(message).append(messageLink);

    return message;
}

function notifyDirectMessagesOnline(loggedUser) {
    var lastMessageID = localStorage.getObjectGromLocalStorage('lastMessageSeenOnApp');
    console.log("last papapapa " + lastMessageID);
    var twitterService = authorizeAndInitializeService().twitterService;
    twitterService.getUserDirectMessagesGreaterThanId(lastMessageID);

    window.setTimeout(function () {
        var newMessages = localStorage.getObjectGromLocalStorage('directMessagesListGreater');

        if (newMessages !== null && newMessages.length !== 0) {
//            localStorage.putObjectInLocalStorage('lastMessageSeenOnApp', newMessages[0]["id"]);
            for (var i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i]["sender_screen_name"] !== loggedUser["alias"] && lastMessageID !== newMessages[i]["id"]) {
                    $("#directMessages").prepend(getRenderedMessage(newMessages[i]));
                    if ($("#circle").text() === "") {
                        $("#circle").text("1");
                    } else {
                        var nr = parseInt($("#circle").text());
                        var b = nr + 1;
                        $("#circle").text(b);
                    }
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
                var format = localStorage.getObjectGromLocalStorage('format' + newMentions[i]["id_str"]);
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
