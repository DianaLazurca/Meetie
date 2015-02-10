//var user = "cev";


var Controller = {

	user: "cev",
	meetigforsort: [],

	setDate: function(){

		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
		    dd='0'+dd;
		} 

		if(mm<10) {
		    mm='0'+mm;
		} 

		var d = yyyy + "-" + mm + "-" + dd;
		document.getElementById("calendar").value = d;
	},

	sortMeetings: function(){
		var html = "";
		var date = document.getElementById("calendar").value;
		
		Controller.meetigforsort.forEach(function(obj){
			if(obj.happening.indexOf(date) > -1){
				html += "<div id = " + obj.id + "><h3>" + obj.title +"</h3>" + obj.host + "<br />" + obj.location + "<br />" + obj.happening + "</div>";
			}
		});
		document.getElementById("meetings").innerHTML = html;
	},

	loadMeetings: function(){
		
		Controller.setDate();

		Controller.meetigforsort.length = 0;
		var query = {
			"happening": {$regex: "(.+)", $options: 'i' },
			"guests": {$regex: "," + Controller.user + ","},
			$sort: {happening: 1}
		}

    	$.ajax({
    		url: "http://localhost:2403/meetings?" + JSON.stringify(query),
    		type: 'GET',
    		crossDomain: true,
		    success:  function (data) {
		       data.forEach(function(obj){
		       		Controller.meetigforsort.push(obj);
		       });
		       Controller.sortMeetings();
		    },
		    error: function(){
		    	console.warn("Error: on loaing meetings");
		    }
    	});


    	
	},

	Compose: {

								//Adauga content pe pagina
		addDate: function(){

			var date = document.getElementById("date_d").value;
			var time = document.getElementById("date_t").value;
			/*if(document.getElementById("dates").innerText !== ""){
				document.getElementById("dates").innerText += ",";
			}*/
			if(document.getElementById("dates").innerText.indexOf(date +": " + time) === -1){
				if(document.getElementById("dates").innerText !== ""){
					document.getElementById("dates").innerText += ",";
				}
				document.getElementById("dates").innerText += date +": " + time;
			}
				
		},

		addGuest: function(){

			var txt = document.getElementById("inp_guests").value;
			/*if(document.getElementById("guests").innerText !== ""){
				document.getElementById("guests").innerText += ",";
			}*/
			if(document.getElementById("guests").innerText.indexOf(txt) === -1){
				if(document.getElementById("guests").innerText !== ""){
					document.getElementById("guests").innerText += ",";
				}
				document.getElementById("guests").innerText += txt;
			}
			//document.getElementById("guests").innerText += txt;
		},

										// trimite invitatii pentru o intalnire nou creata (apelata de sendData)
		sendInvites: function(id, guests){
			var gts = guests.split(",");

			gts.forEach(function(g){
				if(g !== ""){
					$.ajax({
						url: "http://localhost:2403/invitations",
				        type: "POST",
				        crossDomain: true,
				        async : false,
				        data: {
				        	meetingid: id,
				        	userid: g,
				        	respons: null
				        },
				        success: function(){
				        },
				        error: function(){
				        	console.warn("Error: send invitation.");
				        }
				    });
				}
			});
		},
										//trimite informatiile despre o noua intalnire
		sendData: function(){

			var g = ",";
				g += document.getElementById("guests").innerText;
				g += ",";

			$.ajax({
				url: "http://localhost:2403/meetings",
		        type: "POST",
		        crossDomain: true,
		        async : false,
		        data: {
		        	title: document.getElementById("title").value,
		        	description: document.getElementById("description").value,
		        	location: document.getElementById("location").value,
		        	dates: document.getElementById("dates").innerText,
		        	guests: g,
		        	host: Controller.user
		        },
		        success: function(data){
		        	Controller.Compose.sendInvites(data.id, data.guests);
		        },
		        error: function(){
		        	console.warn("Error: sending data for a new meeting.");
		        }
		    });
		}

	},

	Host: {

		html: "",

		filterHost: function(){

			var value = $('input[name=filter]:checked').val();
			if(value === "established"){
				//$(".established").css("display", "block");
				//$(".notestablished").css("display", "none");
				document.getElementById("host-meetings").innerHTML = "";
				Controller.Host.loadHostMeetings(false);

			}
			else{
				//$(".established").css("display", "none");
				//$(".notestablished").css("display", "block");
				document.getElementById("host-meetings").innerHTML = "";
				Controller.Host.loadHostMeetings(true);
			}
		},
									//incarcarea intalnirilor organizate de acest utilizator
		loadHostMeetings: function(established){

			Controller.Host.html = "";
			var query = {
					"host": Controller.user,
					$sort: {title: 1}
				}

			$.ajax({
	    		url: "http://localhost:2403/meetings?" + JSON.stringify(query),
	    		type: 'GET',
	    		crossDomain: true,
			    success:  function (data) {
			    	
			       data.forEach(function(obj){
			       		if((typeof obj.happening === 'undefined') === established)
			       			Controller.Host.addHostMeeting(obj);
			       });
			       //Controller.Host.filterHost();
			       document.getElementById("host-meetings").innerHTML = Controller.Host.html;
			    },
			    error: function(){
			    	console.warn("Error: Load Host Meetings.");
			    }
	    	});
		},

									//adaugarea intalnirilor pe pagina (apeata de loadHostMeetings)
		addHostMeeting: function(obj){

			var guests = [];

			$.ajax({
	    		url: "http://localhost:2403/invitations?meetingid=" + obj.id,
	    		type: 'GET',
	    		crossDomain: true,
	    		async: false,
			    success:  function (data) {
			    	data.forEach(function(d){
			    		guests.push(d);
			    	});
			    },
			    error: function(){
			    	console.log("");
			    }
	    	});

	    	var est = "established";
	    
	    	if(typeof obj.happening === 'undefined'){
	    		est = "notestablished";
	    	}

			var html = "<div id = " + obj.id + " class=" + est + "><h3>" + obj.title +"</h3>" + obj.host + "<p>" + obj.description + "</p>" + obj.location + "<hr />";
			var options = obj.dates.split(",");
			options.forEach(function(option){
				html += "<h4>" + option + "</h4>";
				guests.forEach(function(guest){
					if(guest.respons.indexOf(option) > -1){
						html += guest.userid + "<br />"
					}
				});

			});
			html += "<hr />";
			options.forEach(function(o){
				html += "<br /><input type=\"radio\" name=\"" + obj.id + "\" value = \"" + o +"\"/>" + o;
			});
			html += "<br /><button data-meeting-id = " + obj.id + ">Propose</button></div>";
			
			Controller.Host.html += html;
			//document.getElementById("host-meetings").innerHTML += html;
		}

	},
				//moulul ce gestioneaza invitatiile
	Invites: {

						//incarcarea invitatiilor 
		loadInvites: function(){

			Controller.Invites.html = "";

			var query = {
				"userid": Controller.user,
				"respons": ""
			}

			$.ajax({
	    		url: "http://localhost:2403/invitations?" + JSON.stringify(query),
	    		type: 'GET',
	    		crossDomain: true,
			    success:  function (data) {
			       	Controller.Invites.loadActualInvites(data);

			    },
			    error: function(){
			    	console.warn("Error: loaing invites.");
			    }
	    	});
		},
						//pentru fiecare invitatie ia informatiile ce descriu intalnirea si le afiseaza
		loadActualInvites: function(invs){

			invs.forEach(function(inv){

				$.ajax({
		    		url: "http://localhost:2403/meetings?id=" + inv.meetingid,
		    		type: 'GET',
		    		crossDomain: true,
				    success:  function (obj) {
				    	var html = "<div id = " + obj.id + "><h3>" + obj.title +"</h3>" + obj.host + "<p>" + obj.description + "</p>" + obj.location;
						var options = obj.dates.split(",");
						options.forEach(function(o){
							html += "<br /><input type=\"checkbox\" name=\"" + inv.id + "\" value = \"" + o +"\"/>" + o;
						});
						html += "<br /><button data-meeting-id = \"" + inv.id + "\">Send Response</button>";

						document.getElementById("Invites").innerHTML += html;

				    },
				    error: function(){
				    	console.warn("Error: loading content for an invitation.");
				    }
		    	});
			});
		}

	}


};



















// OK sdaskdaksjdkasd-----------------------------------------------------------


/*
var meetigforsort = [];

function setDate(){

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd;
	} 

	if(mm<10) {
	    mm='0'+mm;
	} 

	var d = yyyy + "-" + mm + "-" + dd;
	document.getElementById("calendar").value = d;
}


function addDate(){

	var date = document.getElementById("date_d").value;
	var time = document.getElementById("date_t").value;
	if(document.getElementById("dates").innerText !== ""){
		document.getElementById("dates").innerText += ",";
	}
	document.getElementById("dates").innerText += date +": " + time;
}

function addGuest(){

	var txt = document.getElementById("inp_guests").value;
	if(document.getElementById("guests").innerText !== ""){
		document.getElementById("guests").innerText += ",";
	}
	document.getElementById("guests").innerText += txt;
}

function sortMeetings(){
	var html = "";
	var date = document.getElementById("calendar").value;
	meetigforsort.forEach(function(obj){
		if(obj.happening.indexOf(date) > -1){
			html += "<div id = " + obj.id + "><h3>" + obj.title +"</h3>" + obj.host + "<br />" + obj.location + "<br />" + obj.happening + "</div>";
		}
	});
	document.getElementById("meetings").innerHTML = html;
}


/*
function readyPost(){

	var postObj = {};
	postObj["title"] = document.getElementById("title").value;
	postObj["description"] = document.getElementById("description").value;
	postObj["dates"] = document.getElementById("dates").innerText;
	var real = {};
	var guests = document.getElementById("guests").innerText.split(",");
	guests.forEach(function(guest){
		real[guest] = "nuss";
	});
	postObj["guest"] = real.toString();
	postObj["host"] = "ANA";

	console.log(postObj);

	return postObj;
}*/


/*
function sendInvites(id, guests){
	var gts = guests.split(",");

	gts.forEach(function(g){
		if(g !== ""){
			$.ajax({
				url: "http://localhost:2403/invitations",
		        type: "POST",
		        //contentType: "application/json",
		        crossDomain: true,
		        async : false,
		        data: {
		        	meetingid: id,
		        	userid: g,
		        	respons: null
		        },
		        success: function(){
		        	
		        },
		        error: function(){
		        	console.log("eroare la intrate invites");
		        }
		      });
		}
		
	});
}


function sendData(){


	var g = ",";
	g += document.getElementById("guests").innerText;
	g += ",";

	$.ajax({
		url: "http://localhost:2403/meetings",
        type: "POST",
        //contentType: "application/json",
        crossDomain: true,
        async : false,
        data: {
        	title: document.getElementById("title").value,
        	description: document.getElementById("description").value,
        	location: document.getElementById("location").value,
        	dates: document.getElementById("dates").innerText,
        	guests: g,
        	host: user
        },
        success: function(data){
        	sendInvites(data.id, data.guests);
        },
        error: function(){
        	console.log("khakakdhakdhjashdkadkahdkadhkaskdhaskdhsakdhkahdkawh22222222");
        }
      });

}


function filterHost(){
	var value = $('input[name=filter]:checked').val();
	if(value === "established"){
		$(".established").css("display", "block");
		$(".notestablished").css("display", "none");
	}
	else{
		$(".established").css("display", "none");
		$(".notestablished").css("display", "block");
	}
}
*/
$(document).on("click", "input[name=filter]", function(e){
	//filterHost();
	Controller.Host.filterHost();
});

					//raspuns la propunerea unui meeting
$(document).on("click", "div[id=host-meetings] button", function(e){

	var value = $('input[name=' + $(this).data("meeting-id") + ']:checked', '#' + $(this).data("meeting-id")).val();

	$.ajax({
		url: "http://localhost:2403/meetings/" + $(this).data("meeting-id"),
        type: "POST",
        crossDomain: true,
        async : false,
        data: {
        	happening: value
        },
        success: function(){
        },
        error: function(){
        	console.log("Error: on proposing a meeting.");
        }
    });

});



						//invites response
$(document).on("click", "div[id=Invites] button", function(e){
	if($(this).data("meeting-id") !== "" && document.title !== "Compose"){
		 var obj = {};
	    obj.fruits = $("input[name=" + $(this).data("meeting-id") +"]:checked").map(function(){
	        return  this.value;
	    }).get();
	    

	    $(this).hide();

	    $.ajax({
			url: "http://localhost:2403/invitations/" + $(this).data("meeting-id"),
	        type: "POST",
	        crossDomain: true,
	        async : false,
	        data: {
	        	respons: obj.fruits.join()
	        },
	        success: function(){
	        },
	        error: function(){
	        	console.log("Error: sending respons to an invitation");
	        }
	    });
	}
});


$(document).ready(function(){
		
	switch(document.title){
		case "Principala": Controller.loadMeetings(); break;
		case "Invites": Controller.Invites.loadInvites(); break;
		case "Host": Controller.Host.loadHostMeetings(false); break;
		case "Compose": break;
	}



	//$('#comment-form').submit(function() {
        //Get the data from the form
		 /* dpd.meetings.post({
		        title: "XXX - Convention",
		        description: "a HOT meeting",
		        dates:["10/12/12: 10:20", "10/12/12: 10:90"],
		        guests:{
		        	"Sasha Grey": "yes"
		        },
		        host: "adkah khskdasd"

		}, function(comment, error) {
			console.log("asaskaskasnaksak saksas");
		        if (error) return showError(error);
		});


		  $.ajax({
    		url: "http://localhost:2403/meeings/",
    		type: 'POST',
    		crossDomain: true,
    		dataType: 'json',
		    success:  function (data) {
		        data.forEach(function(comm){
		        	addComment(comm);
		        });
		    },
		    error: function(){
		    	console.log("");
		    }
    	});*/

	/*
	options = {
		"title": "Ana are mere4444",
		"description": "2 mere mari",
		"dates": ["20/19/128", "1021021212"],
		"guests": {"kskasas": "saksakksas"},
		"host": "adkah khskdasd"
	}*/

	//console.log(options["dates"].toString());

	


  //  });


/*
	function loadHostMeetings(){

		var query = {
			"host": user,
			$sort: {title: 1}
		}

		$.ajax({
    		url: "http://localhost:2403/meetings?" + JSON.stringify(query),
    		type: 'GET',
    		crossDomain: true,
    		//async: false,
    		//dataType: 'json',
		    success:  function (data) {
		    	
		       data.forEach(function(obj){
		       		addHostMeeting(obj);
		       });
		       filterHost();
		    },
		    error: function(){
		    	console.log("");
		    }
    	});

    	
	}



	function addHostMeeting(obj){

		var guests = [];

		$.ajax({
    		url: "http://localhost:2403/invitations?meetingid=" + obj.id,
    		type: 'GET',
    		crossDomain: true,
    		async: false,
    		//dataType: 'json',
		    success:  function (data) {
		    	data.forEach(function(d){
		    		guests.push(d);
		    	});
		    },
		    error: function(){
		    	console.log("");
		    }
    	});

    	var est = "established";
    	console.log(obj.happening);
    	if(typeof obj.happening === 'undefined'){

    		est = "notestablished";
    	}

		var html = "<div id = " + obj.id + " class=" + est + "><h3>" + obj.title +"</h3>" + obj.host + "<p>" + obj.description + "</p>" + obj.location + "<hr />";
		var options = obj.dates.split(",");
		options.forEach(function(option){
			html += "<h4>" + option + "</h4>";
			guests.forEach(function(guest){
				if(guest.respons.indexOf(option) > -1){
					html += guest.userid + "<br />"
				}
			});

		});
		html += "<hr />";
		options.forEach(function(o){
			html += "<br /><input type=\"radio\" name=\"" + obj.id + "\" value = \"" + o +"\"/>" + o;
		});
		html += "<br /><button data-meeting-id = " + obj.id + ">Propose</button></div>";
		document.getElementById("host-meetings").innerHTML += html;
	}



	function loadMeetings(){
		setDate();

		meetigforsort.length = 0;
		var query = {
			"happening": {$regex: "(.+)", $options: 'i' },
			"guests": {$regex: "," + user + ","},
			$sort: {happening: 1}
		}

    	$.ajax({
    		url: "http://localhost:2403/meetings?" + JSON.stringify(query),
    		type: 'GET',
    		crossDomain: true,
    		//async: false,
    		//dataType: 'json',
		    success:  function (data) {
		       data.forEach(function(obj){
		       		meetigforsort.push(obj);
		       		//addToTable(obj);
		       });
		    },
		    error: function(){
		    	console.log("");
		    }
    	});

    	sortMeetings();

	}


	function loadInvites(){

		var query = {
			"userid": user,
			"respons": ""
		}

		$.ajax({
    		url: "http://localhost:2403/invitations?" + JSON.stringify(query),
    		type: 'GET',
    		crossDomain: true,
    		//async: false,
    		//dataType: 'json',
		    success:  function (data) {
		       	loadActualInvites(data);

		    },
		    error: function(){
		    	console.log("");
		    }
    	});
	}

	function loadActualInvites(invs){

		invs.forEach(function(inv){
			

				$.ajax({
		    		url: "http://localhost:2403/meetings?id=" + inv.meetingid,
		    		type: 'GET',
		    		crossDomain: true,
		    		//async: false,
		    		//dataType: 'json',
				    success:  function (obj) {
				    	//var html = "<tr><td>" + obj.title + "</td><td>" + obj.dates + "</td><td>"  + obj.location + "</td><td>"  + obj.description + "</td><td>" + obj.host + "</td></tr>";
						var html = "<div id = " + obj.id + "><h3>" + obj.title +"</h3>" + obj.host + "<p>" + obj.description + "</p>" + obj.location;
						var options = obj.dates.split(",");
						options.forEach(function(o){
							html += "<br /><input type=\"checkbox\" name=\"" + inv.id + "\" value = \"" + o +"\"/>" + o;
						});
						html += "<br /><button data-meeting-id = \"" + inv.id + "\">Send Response</button>";
						document.getElementById("Invites").innerHTML += html;

				    },
				    error: function(){
				    	console.log("");
				    }
		    	});

			

		

		});

	}*/
	
	

/*

	function addMeeting(comment) {
        $('<div class="comment">')
            .append('<div class="author">Posted by: ' + comment.name + '</div>')
            .append('<p>' + comment.comment + '</p>')
            .appendTo('#comments');
    }








{
        	title: options["title"],
        	description: options["description"],
        	dates: options["dates"].toString(),
        	guests: options["guests"].toString(),
        	host: options["host"]
        }







    function loadMeetings(){

    	addComment({'name': "Ana", 'comment': "sndkasdkasdkasds ds d"});

		 
    	$.ajax({
    		url: "http://localhost:2403/comments/",
    		type: 'GET',
    		crossDomain: true,
    		dataType: 'json',
		    success:  function (data) {
		        data.forEach(function(comm){
		        	addComment(comm);
		        });
		    },
		    error: function(){
		    	console.log("");
		    }
    	});

    }
    */

});