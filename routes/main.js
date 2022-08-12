const { query } = require("express");

module.exports = function (app) {
  const admin = require("firebase-admin");
  const firebaseRef = db.ref("main");
  var timeAgo = require('node-time-ago');

  var usersRef = firebaseRef.child("users");
  var journalRef = firebaseRef.child("journal");
  var moodRef = firebaseRef.child("mood_tracker");
  var forumRef = firebaseRef.child("forum");
  var signUpRef = firebaseRef.child("sign-up");

  app.get("/", function (req, res) {
    res.render("homepage.html");
  });

  app.get("/journal", function (req, res) {
    res.render("journal.html");
  });

  app.get("/topNav", function (req, res) {
    res.render("topNav.html", {
      title: "Dynamic title"
    });
  });

  app.get("/forumNav", function (req, res) {
    res.render("forum_nav.html", {
      title: "Dynamic title"
    });
  });

  app.get("/register", function (req, res) {
    res.render("signUp.html", {
      title: "Dynamic title"
    });
  });
  
  //ROUTE DIRECT TO EACH FORUM || GET FORUM ITEMS
  app.get("/eachForum", function (req, res) {
    var forumId = req.query.forumId;
    var forumDataRef = forumRef;

    forumDataRef.child(forumId).once('value')
      .then((querySnapshot) => {
        if (!querySnapshot.numChildren()) { 
          throw new Error('expected at least one result');
        }
        
        if (!querySnapshot.exists()) { 
          throw new Error(`Entry ${forumId} not found.`);
        }

        var forumTitle = querySnapshot.val().forumTitle;
        var currentTime = querySnapshot.val().currentTime;
        var numOfLikes = querySnapshot.val().numOfLikes;
        var numOfReplies = querySnapshot.val().numOfReplies;
        var numOfViews = querySnapshot.val().numOfViews;                         
        var forumContent = querySnapshot.val().forumContent;
        var uploader = querySnapshot.val().username;
       
        let timePast = timeAgo(currentTime);
   
        var viewCount = numOfViews;
        updatedViewCount = viewCount + 1;
        var ref = forumRef.child(forumId);
         
        ref.update({
            numOfViews: updatedViewCount   
        });

        var repliesRef = forumRef.child(forumId).child("forumReplies");
        var replyPost = repliesRef;
        var forum_replies = [];
        

        replyPost.on('value', (data) => {
          data.forEach(function (snapshot) {
            forum_replies.push(snapshot.val());
          })
        });
        console.log(replyPost);
        res.render("eachForum.html", {replyPosts: forum_replies, forumId: forumId, forumTitle:forumTitle, uploader: uploader, currentTime:timePast, numOfLikes:numOfLikes,numOfReplies:numOfReplies,forumContent:forumContent, numOfViews: numOfViews});
      })
      .catch((error) => {
        console.log("Unexpected error:", error);
      })

  });

  //ADD REPLY TO FIREBASE
  app.post("/addReply", function (req, res) {
    username = "user 1";
    forumId = req.body.forumId;
    reply = req.body.userReply;
    let currentTime = new Date();
    let timePast = timeAgo(currentTime);

      
    var ref = forumRef.child(forumId).child("forumReplies"); 
    var newforumList = ref.push();
    newforumList.set({ 
      forumReplyId: newforumList.key,
      username: "user 1",
      reply: reply,
      currentTime: timePast
    });

    var forumListRef = ref;
    var forum_replies = [];
    

    forumListRef.on('value', (data) => { 
      data.forEach(function (snapshot) {
        forum_replies.push(snapshot.val());
      })
    });

    var forumDataRef = forumRef;
    forumDataRef.child(forumId).once('value')
      .then((querySnapshot) => {
        if (!querySnapshot.numChildren()) { // handle rare no-results case
          throw new Error('expected at least one result');
        }
        if (!querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
          throw new Error(`Entry ${forumId} not found.`);
        }
        var numOfReplies = querySnapshot.val().numOfReplies;
   
        var repliesCount = numOfReplies;
        updated_replies_count = repliesCount + 1;
        var forum_post_ref = forumRef.child(forumId);
         
        forum_post_ref.update({
            numOfReplies:  updated_replies_count   
        });

        res.redirect('back');
      })
  });

    //ROUTE DIRECT TO FORUM MAIN PAGE ||GET ALL DATA FROM DB TO DISPLAY
    app.get("/forum_mainpage", function (req, res) {
      var forumListRef = forumRef;
      var forumList = [];

      forumListRef.on('value', (data) => {
        data.forEach(function (snapshot) {
          forumList.push(snapshot.val());
        })
      });

      res.render("forumpage.html", {
        title: "Dynamic title", forumItem: forumList
      });
    });

    //ADD FORUM ITEMS INTO FIREBASE
    app.post("/addForumItem", function (req, res) {
      username = "user 1";
      forumTitle = req.body.forum_name;
      forumContent = req.body.forum_content;
      numOfLikes = 0;
      numOfViews = 0;
      numOfReplies = 0;
      currentTime = new Date();
      var newforumList = forumRef.push();
      newforumList.set({ 
        forumId: newforumList.key,
        username: "user 1",
        forumTitle: req.body.forum_name,
        forumContent: req.body.forum_content,
        numOfLikes: 0,
        numOfViews: 0,
        numOfReplies: 0,
        currentTime: Date()
      });
      console.log(newforumList.key)

      var forumListRef = forumRef;
      var forumList = [];

      forumListRef.on('value', (data) => {
        data.forEach(function (snapshot) {
          forumList.push(snapshot.val());

          
        })
      });

      res.redirect('back');
    });

    app.get("/forumByPopularity", function (req, res) {
      var forumListRef = forumRef;
      var forumList = [];

      forumListRef.orderByValue().on('value', (snapshot) => {
        snapshot.forEach((data) => {
          console.log('The ' + data.val().forumId + 'the likes are ' + data.val().numOfLikes);
          forumListRef.orderByChild(data.val().forumId).once("value").then((list) => {
            list.forEach((product) => {
              console.log(product.val())
              
            })
          })

          // var orderByPopular = forumRef.child(data.val().forumId);
          // orderByPopular.orderByValue().once("value").then((list) => {
          //   list.forEach((product) => {
          //     console.log(product.val())
          //     forumList.push(product.val());
          //     console.log(forumList);

          //   })
          // })
          // forumList.push(data.val());
          

        });
      });
    
      res.render("forumpage.html", {forumItem: forumList});
    });

    //REGISTER
    app.post('/registerUser', function (req, res, next) {
      var email = req.body.email;
      var password = req.body.password;

      admin
        .auth()
        .createUser({
          email: email,
          password: password,
        })
        .then((userRecord) => {
          console.log('Successfully created new user:', userRecord.uid);
          signUpRef.push().set({
            "userID": userRecord.uid,
            "email": email,
          });
        })
        .catch((error) => {
          console.log('Error creating new user:', error);
        });
    });

    
  
    
    //-----mood_tracker-----
    //insert happy mood
    app.get("/happy", function (req, res) {
      console.log("mood = happy")
      username = "user 1";
      mood = "happy";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists();          //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
            if (a == true) {
                userMood.set({     
                    username: "user 1",
                    mood: mood,
                    currentTime: currentDate
                });
            } else if (a == false) {
                userMood.set({     
                    username: "user 1",
                    mood: mood,
                    currentTime: currentDate
                });
            } else {
              console.log("error adding mood")
            }
          });
      res.redirect('back');
    });


    //insert mad mood
    app.get("/mad", function (req, res) {
      console.log("mood = mad")
      username = "user 1";
      mood = "mad";
    
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists(); //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
            if (a == true) {
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate     
              });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate
              });
            } else {
              console.log("error adding mood")
            }
          
        });
      res.redirect('back');
    });

    //insert sad mood   
    app.get("/sad", function (req, res) {
      console.log("mood = sad")
      username = "user 1";
      mood = "sad";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists(); //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
          console.log(a);
            if (a == true) {       
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate   
            });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate     
              });
            } else {
              console.log("error adding mood")
            }
          });
      res.redirect('back');
    });

    //insert cool mood 
    app.get("/cool", function (req, res) {
      console.log("mood = cool")
      username = "user 1";
      mood = "cool";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists(); //-- when query is empty -- false || when query is not empty -- true
            if (a == true) {
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate             
            });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate 
              });
            } else {
              console.log("error adding mood")
            }
          });
      
      res.redirect('back');
    });

    //route to mood_tracker || insert neutral moods to display on the html calendar
    app.get("/neutral", function (req, res) {
      console.log("mood = neutral")
      username = "user 1";
      mood = "neutral";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear(); 
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists();//-- when query is empty -- false || when query is not empty -- true
            if (a == true) {              
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate              
            });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate                
              });
            } else {
              console.log("error adding mood")
            }
        });
      
      res.redirect('back');
    });
      

    //insert getting mood 
    app.get("/mood_tracker", function (req, res) {
      username = "user 1";     
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear(); 
      let currentDate = date + + month + year;

      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
      .then((querySnapshot) => {
        //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
        var a = querySnapshot.exists();
        console.log(a);

          if (a == true) {
            
            userMood.once('value')
              .then((querySnapshot) => {
                if (!querySnapshot.numChildren()) {
                  var today_mood = "empty";
                }
                if (!querySnapshot.exists()) {
                  var today_mood = "empty";
                }
                var today_mood = querySnapshot.val().mood;
                console.log("mood today is " + today_mood);  

                res.render("mood_tracker.html", {
                  title: "Dynamic title", today_mood : today_mood
                });
              });
          } else if (a == false) {
            var today_mood = "empty";
                console.log("mood today is " + today_mood);  

                res.render("mood_tracker.html", {
                  title: "Dynamic title", today_mood : today_mood
                });
          } else {
            console.log("error adding mood")
          }
      });
      
      
    });
  }
