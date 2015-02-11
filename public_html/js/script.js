//var user = "cev";


var Controller = {
    user: JSON.parse(localStorage.getItem('loggedinUser'))["alias"],
    meetigforsort: [],
    setDate: function () {

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        var d = mm + "/" + dd + "/" + yyyy;
        document.getElementById("date-picker-3").value = d;
    },
    sortMeetings: function () {

        var html = "";
        var date = document.getElementById("date-picker-3").value;

        var d = date.split("/");

        var date = d[2] + "-" + d[0] + "-" + d[1];
        var query;
        var count = 1;

        Controller.meetigforsort.forEach(function (obj) {
            if (obj.happening.indexOf(date) > -1 && obj.valid === "1") {

                if (obj.host === Controller.user) {
                    html += "<tr data-meetingid=\"" + obj.id + "\" class=\"success\"><td>" + count + "</td><td>" + obj.title + "</td><td>" + obj.happening.split(" ")[1] + "</td><td>" + obj.location + "</td>";
                    html += "<td><img src=\"images/succes.png\" /></td></tr>";
                }
                else {
                    query = {
                        "meetingid": obj.id,
                        "userid": Controller.user
                    }

                    $.ajax({
                        url: "http://localhost:8383/invitations?" + JSON.stringify(query),
                        type: 'GET',
                        crossDomain: true,
                        async: false,
                        success: function (data) {
                            html += "<tr id=\"" + data[0].id + "\" data-meetingid=\"" + obj.id + "\" class=\"";
                            switch (data[0].respons) {
                                case "":
                                    html += "warning";
                                    break;
                                case "Not":
                                    html += "danger";
                                    break;
                                default:
                                    html += "success";
                            }

                            html += "\" vocab=\"http://schema.org/\" typeof=\"Event\"><td>" + count + "</td><td property=\"name\">" + obj.title + "</td><td>" + obj.happening.split(" ")[1] + "</td><td>" + obj.location + "</td>";
                            html += "<td><a href=\"success\"><img src=\"images/succes.png\" />&nbsp;&nbsp;</a><a href=\"warning\"><img src=\"images/pending.png\" /></a>&nbsp;&nbsp;<a href=\"danger\"><img src=\"images/cancel.png\" /></a></td></tr>";


                        },
                        error: function () {
                            console.warn("Error: on loaing meetings");
                        }
                    });
                }

                count++;

            }
        });
        document.getElementById("table-body").innerHTML = html;
    },
    loadMeetings: function () {

        Controller.setDate();

        Controller.meetigforsort.length = 0;
        var query = {
            "happening": {$regex: "(.+)", $options: 'i'},
            $or: [{
                    host: Controller.user
                }, {
                    guests: {$regex: "," + Controller.user + ","}
                }],
            $sort: {happening: 1}
        }

        $.ajax({
            url: "http://localhost:8383/meetings?" + JSON.stringify(query),
            type: 'GET',
            crossDomain: true,
            async: false,
            success: function (data) {
                data.forEach(function (obj) {
                    Controller.meetigforsort.push(obj);
                });
                Controller.sortMeetings();
            },
            error: function () {
                console.warn("Error: on loaing meetings");
            }
        });



    },
    Compose: {
        guests: [],
        //Adauga content pe pagina
        addDate: function () {

            var date = document.getElementById("date_d").value;
            var time = document.getElementById("date_t").value;

            if (document.getElementById("dates").innerText.indexOf(date + ": " + time) === -1) {
                if (document.getElementById("dates").innerText !== "") {
                    document.getElementById("dates").innerText += ",";
                }
                document.getElementById("dates").innerText += date + ": " + time;
            }

        },
        addGuest: function (guest) {

            //var txt = document.getElementById("inp_guests").value;

            var html = "";
            if (Controller.Compose.guests.indexOf(guest) === -1) {
                if (document.getElementById("guests").innerText !== "") {
                    html = ", ";
                }

                if (guest !== Controller.user) {
                    Controller.Compose.guests.push(guest);
                    document.getElementById("guests").innerText += html + guest;
                }
            }

        },
        search: function () {
            var txt = document.getElementById("inp_guests").value;

            var followersList = localStorage.getObjectGromLocalStorage('followersList');
            var loggedUser = localStorage.getObjectGromLocalStorage('loggedinUser');
            parseList(followersList);
            var user = initializeUser(loggedUser["id"], loggedUser["screen_name"],
                    loggedUser["name"], loggedUser["alias"],
                    loggedUser["avatar"], null, followersList);

            var followers = new Array(user.getFollowers()["users"]);
            for (var i = 0; i < followers[0].length; i++) {
                console.log(followers[0][i]);
                if (followers[0][i]["screen_name"] === txt) {
                    var html = "<div class=\"desc\"><div class=\"details\"><a href=\"" + txt + "\">" + txt + "</a></div></div>";
                    document.getElementById("search-resuts").innerHTML += html;
                }

            }
        },
        form_reset: function () {

            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
            document.getElementById("location").value = "";
            document.getElementById("date_d").value = "";
            document.getElementById("date_t").value = "";

            document.getElementById("dates").innerText = "";
            document.getElementById("guests").innerText = "";
            Controller.Compose.guests.length = 0;
        },
        // trimite invitatii pentru o intalnire nou creata (apelata de sendData)
        sendInvites: function (id, guests) {
            var gts = guests.split(",");

            gts.forEach(function (g) {
                if (g !== "") {
                    $.ajax({
                        url: "http://localhost:8383/invitations",
                        type: "POST",
                        crossDomain: true,
                        async: false,
                        data: {
                            meetingid: id,
                            userid: g,
                            respons: null
                        },
                        success: function () {
                        },
                        error: function () {
                            console.warn("Error: send invitation.");
                        }
                    });
                }
            });
        },
        //trimite informatiile despre o noua intalnire
        sendData: function () {


            var title = document.getElementById("title").value;
            var location = document.getElementById("location").value;
            var dates = document.getElementById("dates").innerText;
            var gsts = Controller.Compose.guests.join();

            if (title === "" || location === "" || dates === "" || gsts === "") {
                return;
            }

            var g = ",";
            g += gsts;
            g += ",";
            var ivitedPeople = gsts.split(',');
            twitterService = authorizeAndInitializeService().twitterService;
            var status = "[New Invite] " + title + " Where : " + location + " When: " + dates + " With: ";
            for (var i = 0; i < ivitedPeople.length; i++) {
                status += "@" + ivitedPeople[i]+" ";
            }
            twitterService.postMessage(status);

            $.ajax({
                url: "http://localhost:8383/meetings",
                type: "POST",
                crossDomain: true,
                async: false,
                data: {
                    title: title,
                    description: document.getElementById("description").value,
                    location: location,
                    dates: dates,
                    guests: g,
                    host: Controller.user,
                    valid: "1"
                },
                success: function (data) {
                    Controller.Compose.sendInvites(data.id, data.guests);

                },
                error: function () {
                    console.warn("Error: sending data for a new meeting.");
                }
            });

            Controller.Compose.form_reset();
        }

    },
    Host: {
        html: "",
        filterHost: function () {

            var value = $('input[name=filter]:checked').val();
            if (value === "established") {
                document.getElementById("host-meetings").innerHTML = "";
                Controller.Host.loadHostMeetings(false);

            }
            else {
                document.getElementById("host-meetings").innerHTML = "";
                Controller.Host.loadHostMeetings(true);
            }
        },
        //incarcarea intalnirilor organizate de acest utilizator
        loadHostMeetings: function (established) {

            Controller.Host.html = "";
            var query = {
                "host": Controller.user,
                $sort: {title: 1}
            }

            $.ajax({
                url: "http://localhost:8383/meetings?" + JSON.stringify(query),
                type: 'GET',
                crossDomain: true,
                success: function (data) {

                    data.forEach(function (obj) {
                        if ((typeof obj.happening === 'undefined') === established)
                            Controller.Host.addHostMeeting(obj);
                    });
                    if (Controller.Host.html === "" && established === false) {
                        Controller.Host.html = "<div class=\"row\"><div class=\"col-lg-12 ds form-panel\">You are not hosting any established meetings at this moment.</div></div>";
                    }
                    if (Controller.Host.html === "" && established === true) {
                        Controller.Host.html = "<div class=\"row\"><div class=\"col-lg-12 ds form-panel\">You are not hosting any meetings that are not established at this moment.</div></div>";
                    }

                    document.getElementById("host-meetings").innerHTML = Controller.Host.html;
                },
                error: function () {
                    console.warn("Error: Load Host Meetings.");
                }
            });
        },
        //adaugarea intalnirilor pe pagina (apeata de loadHostMeetings)
        addHostMeeting: function (obj) {
            if (obj.valid === "1") {
                var guests = [];

                $.ajax({
                    url: "http://localhost:8383/invitations?meetingid=" + obj.id,
                    type: 'GET',
                    crossDomain: true,
                    async: false,
                    success: function (data) {
                        data.forEach(function (d) {
                            guests.push(d);
                        });
                    },
                    error: function () {
                        console.log("");
                    }
                });

                var est = "established";

                if (typeof obj.happening === 'undefined') {
                    est = "notestablished";
                }

                var html = "<div id = " + obj.id + " class=" + est + " col-lg-11 ds>";

                html += "<div class=\"row\"><div class=\"col-lg-2 ds\"><h2>Guests</h2>";

                var options = obj.dates.split(",");
                options.forEach(function (option) {
                    var aux = option.split(":");
                    var reverse = aux[1] + ":" + aux[2];
                    aux = aux[0].split("-");
                    reverse += "&nbsp;&nbsp;" + aux[2] + "-" + aux[1] + "-" + aux[0];

                    html += "<div class=\"desc\"><div class=\"details\"><h5>" + reverse + "</h5>";
                    guests.forEach(function (guest) {
                        if (guest.respons.indexOf(option) > -1) {
                            html += "<muted>" + guest.userid + "</muted><br />";
                        }
                    });
                    html += "</div></div>";

                });
                html += "<div class=\"desc\"><div class=\"details\"><h5>Not Comming</h5>";
                guests.forEach(function (guest) {
                    if (guest.respons.indexOf("Not") > -1) {
                        html += guest.userid + "<br />";
                    }
                });
                html += "</div></div>";

                html += "<div class=\"desc\"><div class=\"details\"><h5>Waiting</h5>";
                guests.forEach(function (guest) {
                    if (guest.respons === "") {
                        html += guest.userid + "<br />";
                    }
                });
                html += "</div></div></div><div class=\"col-lg-9 ds\">";


                html += "<div class=\"row\"><h2>" + obj.title + "</h2><div class=\"form-panel\">" + obj.description + "<br /><br />Location: " + obj.location + "<br /><hr />";
                html += "<div class=\"form-group\">";
                options.forEach(function (o) {
                    var aux = o.split(":");
                    var reverse = aux[1] + ":" + aux[2];
                    aux = aux[0].split("-");
                    reverse += "&nbsp;" + aux[2] + "-" + aux[1] + "-" + aux[0];

                    html += "<input type=\"radio\" name=\"" + obj.id + "\" value = \"" + o + "\" class=\"css-checkbox\" />" + reverse + "&nbsp;&nbsp;";
                });
                html += "</div><div class=\"form-group\"><button data-meeting-id = " + obj.id + " class=\"btn btn-default\">Propose</button>&nbsp;&nbsp;";
                html += "<button data-action=\"cancel\" data-meeting-id = " + obj.id + " class=\"btn btn-default\">Cancel</button></div>"
                html += "</div></div> </div> </div> </div>";

                Controller.Host.html += html;
            }

        }

    },
    //moulul ce gestioneaza invitatiile
    Invites: {
        //incarcarea invitatiilor 
        loadInvites: function () {

            Controller.Invites.html = "";

            var query = {
                "userid": Controller.user,
                "respons": ""
            }

            $.ajax({
                url: "http://localhost:8383/invitations?" + JSON.stringify(query),
                type: 'GET',
                crossDomain: true,
                success: function (data) {
                    Controller.Invites.loadActualInvites(data);

                },
                error: function () {
                    console.warn("Error: loaing invites.");
                }
            });
        },
        //pentru fiecare invitatie ia informatiile ce descriu intalnirea si le afiseaza
        loadActualInvites: function (invs) {
            var count = 0;
            invs.forEach(function (inv) {

                $.ajax({
                    url: "http://localhost:8383/meetings?id=" + inv.meetingid,
                    type: 'GET',
                    crossDomain: true,
                    async: false,
                    success: function (obj) {
                        if (obj.valid === "1") {
                            var html = "<div id = " + obj.id + "vocab=\"http://schema.org/\" typeof=\"Event\"><h2><span property=\"name\">" + obj.title + "</span>&nbsp;&nbsp;<small>Hosted by: <span property=\"organizer\" typeof=\"Person\"><span property=\"name\">" + obj.host + "</span></span></small></h2>";
                            html += "<div class=\"form-panel\"><p property=\"description\">" + obj.description + "</p>Location: <span property=\"location\" typeof=\"Place\"><span property=\"name\">" + obj.location + "</span></span><hr />";
                            var options = obj.dates.split(",");
                            html += "<div class=\"form-group\">";
                            options.forEach(function (o) {
                                html += "<input type=\"checkbox\" name=\"" + inv.id + "\" value = \"" + o + "\"/>" + o + "&nbsp;&nbsp;";
                            });
                            html += "<input type=\"checkbox\" name=\"" + inv.id + "\" value=\"Not\"> Not Comming</div>";
                            html += "<div class=\"form-group\"><button class=\"btn btn-default\" data-meeting-id = \"" + inv.id + "\">Send Response</button></div></div></div>";

                            document.getElementById("Invites").innerHTML += html;
                            count = 1;
                        }
                    },
                    error: function () {
                        console.warn("Error: loading content for an invitation.");
                    }
                });

            });
            if (count === 0) {
                document.getElementById("Invites").innerHTML = "<div class=\"row\"><div class=\"col-lg-12 ds form-panel\">You didn't receive any new invitations.</div></div>";
            }
        }

    }


};



$(document).on("click", "input[name=filter]", function (e) {
    Controller.Host.filterHost();
});

//raspuns la propunerea unui meeting
$(document).on("click", "div[id=host-meetings] button", function (e) {

    if (!$(this).data("action")) {
        var value = $('input[name=' + $(this).data("meeting-id") + ']:checked', '#' + $(this).data("meeting-id")).val();

        $.ajax({
            url: "http://localhost:8383/meetings/" + $(this).data("meeting-id"),
            type: "POST",
            crossDomain: true,
            async: false,
            data: {
                happening: value,
                valid: "1"
            },
            success: function () {
                console.log("proposed");
            },
            error: function () {
                console.log("Error: on proposing a meeting.");
            }
        });
    }
    else {
        console.log($(this).data("meeting-id"));

        $.ajax({
            url: "http://localhost:8383/meetings/" + $(this).data("meeting-id"),
            type: "POST",
            crossDomain: true,
            data: {
                valid: "0"
            },
            success: function () {
            },
            error: function () {
                console.log("Error: on proposing a meeting.");
            }
        });

    }
    $(this).hide();

});



//invites response
$(document).on("click", "div[id=Invites] button", function (e) {
    if ($(this).data("meeting-id") !== "" && document.title !== "Compose") {
        var obj = {};
        obj.fruits = $("input[name=" + $(this).data("meeting-id") + "]:checked").map(function () {
            return  this.value;
        }).get();


        $(this).hide();

        $.ajax({
            url: "http://localhost:8383/invitations/" + $(this).data("meeting-id"),
            type: "POST",
            crossDomain: true,
            async: false,
            data: {
                respons: obj.fruits.join()
            },
            success: function () {
            },
            error: function () {
                console.log("Error: sending respons to an invitation");
            }
        });
    }
});


$(document).on("change", "input[value=Not]", function (e) {

    if ($(this).prop('checked')) {
        $("input[name=" + $(this).attr("name") + "]").each(function (o) {
            $(this).prop('checked', false);
        });
        $(this).prop('checked', true);
    }
});


$(document).on("change", "input[type=checkbox][value!=Not]", function (e) {


    if ($("input[name=" + $(this).attr("name") + "][value=Not]").prop("checked")) {
        $("input[name=" + $(this).attr("name") + "][value=Not]").prop("checked", false);
    }
});


$(document).on("click", "tbody a", function (e) {
    e.preventDefault();
    if ($(this).attr("href") !== $(this).parent().parent().attr("class")) {

        //console.log($(this).parent().parent());
        var aux = $(this).parent().parent().attr("id");
        if ($(this).attr("href") === "success") {

            $.ajax({
                url: "http://localhost:8383/meetings?id=" + $(this).parent().parent().data("meetingid"),
                type: 'GET',
                crossDomain: true,
                async: false,
                success: function (data) {

                    $.ajax({
                        url: "http://localhost:8383/invitations?id=" + aux,
                        type: 'POST',
                        crossDomain: true,
                        async: false,
                        data: {
                            respons: data.happening
                        },
                        success: function (data) {

                        },
                        error: function () {
                            console.warn("Error: la actualizare in tabela principala");
                        }
                    });

                },
                error: function () {
                    console.warn("Error: on loaing meetings");
                }
            });


        }
        else {
            if ($(this).attr("href") === "danger") {

                $.ajax({
                    url: "http://localhost:8383/invitations?id=" + aux,
                    type: 'POST',
                    crossDomain: true,
                    async: false,
                    data: {
                        respons: "Not"
                    },
                    success: function (data) {

                    },
                    error: function () {
                        console.warn("Error: la actualizare in tabela principala");
                    }
                });
            }
            else {
                $.ajax({
                    url: "http://localhost:8383/invitations?id=" + aux,
                    type: 'POST',
                    crossDomain: true,
                    async: false,
                    data: {
                        respons: ""
                    },
                    success: function (data) {

                    },
                    error: function () {
                        console.warn("Error: la actualizare in tabela principala");
                    }
                });
            }
        }

        $(this).parent().parent().attr("class", $(this).attr("href"));
    }
});


$(document).on("click", "div[class=details] a", function (e) {
    e.preventDefault();
    Controller.Compose.addGuest($(this).attr("href"));
});

$(document).ready(function () {

    switch (document.title) {
        case "Principala":
            Controller.loadMeetings();
            break;
        case "Invites":
            Controller.Invites.loadInvites();
            break;
        case "Host":
            Controller.Host.loadHostMeetings(false);
            break;
        case "Compose":
            break;
    }

});

function parseList(list) {
    var friendList = new Array(0);
    for (var user in list["users"]) {
        var userFriend = initializeUser(list["users"][user]["id"], list["users"][user]["screen_name"],
                list["users"][user]["name"], list["users"][user]["alias"],
                list["users"][user]["profile_image_url"]);
        friendList.push(userFriend);

    }
    return friendList;
}

function initializeUser(id, name, screen_name, alias, picture, friendsList, followersList) {
    var userFriend = new meetie.UserModel.User(id, screen_name, name, alias, picture);
    userFriend.setFriends(friendsList);
    userFriend.setFollowers(followersList);

    return userFriend;
}