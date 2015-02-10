var meetie = {  
   
  UserModel :{ 
    User : function (id, screen_name, name, alias, picture){ 
    
    this.id = id;
    this.screen_name = screen_name;
    this.name = name;
    this.alias = alias;
    this.picture = picture;
    this.friends = new Array(0);
    this.followers = new Array(0);
	
    }
},
  TwitterServiceModel : {
    TwitterService: function(oauthResult ) {
      this.oauthResult = oauthResult;
           
    }
  }  
    
};

meetie.UserModel.User.prototype = {
  getId: function(){
    return this.id;
  },
  setFriends: function(friendsList){
      this.friends = friendsList;
  },
  setFollowers: function(followersList){
      this.followers = followersList;
  },
  getScreenName: function(){
    return this.screen_name;
  },
  getName: function(){
    return this.name;
  },
  getAlias: function(){
    return this.alias;
  },
  getPicture: function(){
    return this.picture;
  },
  getFriends: function(){
    return this.friends;
  },
  getFollowers: function(){
    return this.followers;
  }
  
  
};

meetie.TwitterServiceModel.TwitterService.prototype = {
  getOauthResult: function(){
    return this.oauthResult;
  },
  friendsList: function(id){
    var url = "https://api.twitter.com/1.1/friends/list.json?user_id="+id;
    this.getOauthResult().get(url).done(function(data) {
            localStorage.putObjectInLocalStorage('friendsList', data); 
          
        }).fail(function (err) {
            console.log("Failed to get all friends for " + id);
        });
        
    },
   followersList: function(id){
        var url = "https://api.twitter.com/1.1/followers/list.json?user_id="+id;
        this.getOauthResult().get(url).done(function(data) {
                localStorage.putObjectInLocalStorage('followersList', data); 
            }).fail(function (err) {
                console.log("Failed to get all followers for " + id);
        });
        
    },
    postMessage:function(status){
        result.post('/1.1/statuses/update.json', {
                         data: {
                                status: status
                            }
                }).done(function(data) {
                     // what to do with all I receive  
                }).fail(function(err) {
                        console.log("Failed to tweet");
                });
    },
    getUserDirectMessages:function(id){
        var url = "https://api.twitter.com/1.1/direct_messages.json";
        this.getOauthResult().get(url).done(function(data) {               
                localStorage.putObjectInLocalStorage('directMessagesList', data); 
            }).fail(function (err) {
                console.log("Failed to get all messages for " + id);
        });
    },
    getUserMentions:function(id){
        var url = "https://api.twitter.com/1.1/statuses/mentions_timeline.json";
        this.getOauthResult().get(url).done(function(data) {
                localStorage.putObjectInLocalStorage('mentionsList', data); 
            }).fail(function (err) {
                console.log("Failed to get all mentions for " + id);
        });
    },
    getUserTweets:function(id){
        var url = "https://api.twitter.com/1.1/statuses/user_timeline.json";
        this.getOauthResult().get(url).done(function(data) {
                localStorage.putObjectInLocalStorage('userTweets', data); 
            }).fail(function (err) {
                console.log("Failed to get all mentions for " + id);
        });
    },
    displayTwitterFormat:function(id){
        var url = "https://api.twitter.com/1.1/statuses/oembed.json?id="+id;
        this.getOauthResult().get(url).done(function(data) {
                localStorage.putObjectInLocalStorage("format"+id,data);
            }).fail(function (err) {
                console.log("Failed to get the tweet with id :  " + id);
        });
    },
    logoutTwitter: function(){
                OAuth.clearCache('twitter');
                localStorage.clear();
                localStorage.putObjectInLocalStorage('lastLogout',getCurrentDateTime());
                console.log(" logout " + getCurrentDateTime());
                window.location.href = "index.html";
                
    },
    twitterLogin: function(){
        OAuth.popup('twitter', {cache: true}).done(function (twitter) {
        twitter.me().done(function(data) {
                localStorage.putObjectInLocalStorage('loggedinUser',data);
                twitterService = authorizeAndInitializeService().twitterService;
                twitterService.friendsList(data["id"]);
                twitterService.followersList(data["id"]);
                twitterService.getUserMentions(data["id"]);
                twitterService.getUserDirectMessages(data["id"]);
                twitterService.getUserTweets(data["id"]);
                
                window.setTimeout(function () {
                        window.location.href = "mainPage.html";
                }, 1000);
            }).fail(function(err){
                console.log(err);
            });

        }).fail(function () {
                alert("Twitter authentication failed. Cannot provide results from Twitter. Please try again.");
        });
        
    }
  
};


Storage.prototype.putObjectInLocalStorage = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObjectGromLocalStorage = function(key) {
    var value = this.getItem(key);
    return  JSON.parse(value);
};

function authorizeAndInitializeService(){
    OAuth.initialize('NxfQddkW2whsh0-6HcSso1UvVYw');
    var twitter = OAuth.create('twitter');
    return { 'twitter' : twitter, 'twitterService': new meetie.TwitterServiceModel.TwitterService(twitter) };
}

function parseList( list){
    var friendList = new Array(0);
    for (var user in list["users"]){
        //console.log(list["users"][user]);
         var userFriend = initializeUser(list["users"][user]["id"],list["users"][user]["screen_name"],
                                         list["users"][user]["name"],list["users"][user]["alias"], 
                                         list["users"][user]["profile_image_url"]);
         friendList.push(userFriend);
        
    }
    return friendList;
}

function initializeUser(id,name,screen_name,alias, picture, friendsList,followersList){
     var userFriend = new meetie.UserModel.User(id,screen_name,name,alias,picture);
     userFriend.setFriends(friendsList);
     userFriend.setFollowers(followersList);
     
     return userFriend;
}
function convertToDate( string){
  return new Date(string).getTime();
}
function getCurrentDateTime(){
 
    /*var objToday = new Date(),
        weekday = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
        dayOfWeek = weekday[objToday.getDay()],       
        dayOfMonth = today + (objToday.getDate() < 10) ? '0'  : objToday.getDate(),
        months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
        curMonth = months[objToday.getMonth()],
        curYear = objToday.getFullYear(),
        curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
        curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
        curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds()
        var today = dayOfWeek + " " + curMonth + " " +  dayOfMonth +" " + curHour + ":" + curMinute + ":" + curSeconds + " " +curYear ;
    return today; */
    return new Date().getTime();
}