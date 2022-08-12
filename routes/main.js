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

    app.get("/mood_tracker", function (req, res) {


      res.render("mood_tracker.html")
    });

    app.get("/journal", function (req, res) {
      res.render("journal.html");
    });

    //app.post()
  
  app.get("/eachForum", function (req, res) {
    // let forumTitle = [req.query.name];
    var forumId = req.query.forumId;
    var forumDataRef = forumRef;

    forumDataRef.child(forumId).once('value')
      .then((querySnapshot) => {
        if (!querySnapshot.numChildren()) { // handle rare no-results case
          throw new Error('expected at least one result');
        }
        // let dataSnapshot; 
        // querySnapshot.forEach((snap) => dataSnapshot = snap); // get the snapshot we want out of the query's results list

        if (!querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
          throw new Error(`Entry ${forumId} not found.`);
        }

        // do what you want with dataSnapshot
        // console.log(`Entry ${forumId}'s data is:`, dataSnapshot.val());
        var forumTitle = querySnapshot.val().forumTitle;
        var currentTime = querySnapshot.val().currentTime;
        var numOfLikes = querySnapshot.val().numOfLikes;
        var numOfReplies = querySnapshot.val().numOfReplies;
        var numOfViews = querySnapshot.val().numOfViews;                         
        var forumContent = querySnapshot.val().forumContent;
        var uploader = querySnapshot.val().username;
        // let date = ("0" + currentTime.getDate()).slice(-2);
        // let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
        // let year = currentTime.getFullYear();
        let timePast = timeAgo(currentTime);
        // console.log("original view count " + dataSnapshot.val().numOfViews);
   
        var viewCount = numOfViews;
        updatedViewCount = viewCount + 1;
        // console.log("updatedViewCount " + updatedViewCount);
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

  app.post("/addReply", function (req, res) {
    username = "user 1";
    forumId = req.body.forumId;
    reply = req.body.userReply;
    let currentTime = new Date();
    // let date = ("0" + currentTime.getDate()).slice(-2);
    // let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
    // let year = currentTime.getFullYear();
    let timePast = timeAgo(currentTime);

    // console.log("id " + forumId)
      
    var ref = forumRef.child(forumId).child("forumReplies"); //upload reviews
    var newforumList = ref.push();
    newforumList.set({ //set the data with id    
      forumReplyId: newforumList.key,
      username: "user 1",
      reply: reply,
      currentTime: timePast
    });

    var forumListRef = ref;
    var forum_replies = [];
    

    forumListRef.on('value', (data) => { //get Reviews
      data.forEach(function (snapshot) {
        forum_replies.push(snapshot.val());
      })
    });

    var forumDataRef = forumRef;
    var forumData = [];
    forumDataRef.child(forumId).once('value')
      .then((querySnapshot) => {
        if (!querySnapshot.numChildren()) { // handle rare no-results case
          throw new Error('expected at least one result');
        }
        // let dataSnapshot;
        // querySnapshot.forEach((snap) => dataSnapshot = snap); // get the snapshot we want out of the query's results list

        if (!querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
          throw new Error(`Entry ${forumId} not found.`);
        }

        // do what you want with dataSnapshot
        // console.log(`Entry ${forumId}'s data is:`, dataSnapshot.val());
        var numOfReplies = querySnapshot.val().numOfReplies;
        // console.log("original view count " + dataSnapshot.val().numOfViews);
   
        var repliesCount = numOfReplies;
        updated_replies_count = repliesCount + 1;
        var forum_post_ref = forumRef.child(forumId);
         
        forum_post_ref.update({
            numOfReplies:  updated_replies_count   
        });


        // res.redirect('back', {
        //   replyPosts: forum_replies, forumId: forumId, forumTitle: forumTitle, uploader: uploader, currentTime: currentTime, numOfLikes: numOfLikes, numOfReplies: numOfReplies, forumContent: forumContent, numOfViews: numOfViews
        // });
        res.redirect('back');
      })
  });


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


    app.post("/addForumItem", function (req, res) {
      username = "user 1";
      forumTitle = req.body.forum_name;
      forumContent = req.body.forum_content;
      numOfLikes = 0;
      numOfViews = 0;
      numOfReplies = 0;
      currentTime = new Date();
      var newforumList = forumRef.push();
      newforumList.set({ //set the data with id
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
  
    app.get("/test", function (req, res) {
      res.render("test.html", {
        title: "Dynamic title"
      });
    });
  
    app.get("/register", function (req, res) {
      res.render("signUp.html", {
        title: "Dynamic title"
      });
    });

    app.post('/registerUser', function (req, res, next) {
      var email = req.body.email;
      var password = req.body.password;

      // firebaseRef.auth().setPersistence(firebaseRef.auth.Auth.Persistence.NONE);

      admin
        .auth()
        .createUser({
          email: email,
          password: password,
        })
        .then((userRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
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
  
  //search
  // app.get("/search-result", function (req, res) {
  //     res.send(req.query);
  // });


  // app.get("/search-result", function (req, res) {
  //     res.send(req.query.keyword);
  // });


  // app.get("/search-result", function (req, res) {
  //     res.send("This is the keyword you entered: " + req.query.keyword + "<br>" + "This is the result of the search:");
  // });

  // //search for the device name from the database
  // app.get("/search-result-db", function (req, res) {
  //   let word = [req.query.keyword;
  //   var forumDataRef = forumRef;
  //   forumDataRef.orderByChild("forumTitle").equalTo(word).on("child_added", function(snapshot) {
  //     console.log(snapshot.key);
  //   });
    
      // .then((querySnapshot) => {
      //   if (!querySnapshot.numChildren()) { // handle rare no-results case
      //     throw new Error('expected at least one result');
      //   }
      //   let dataSnapshot; 
      //   querySnapshot.forEach((snap) => dataSnapshot = snap); // get the snapshot we want out of the query's results list

      //   if (!dataSnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
      //     throw new Error(`Entry ${word} not found.`);
      //   }

      //   // do what you want with dataSnapshot
      //   console.log(`Entry ${forumId}'s data is:`, dataSnapshot.val());
      //   // var forumTitle = querySnapshot.val().forumTitle;
      //   // var currentTime = querySnapshot.val().currentTime;
      //   // var numOfLikes = querySnapshot.val().numOfLikes;
      //   // var numOfReplies = querySnapshot.val().numOfReplies;
      //   // var numOfViews = querySnapshot.val().numOfViews;
      //   // var forumContent = querySnapshot.val().forumContent;
      //   // var uploader = querySnapshot.val().username;
      //   // let date = ("0" + currentTime.getDate()).slice(-2);
      //   // let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      //   // let year = currentTime.getFullYear();
      //   let timePast = timeAgo(currentTime)
      // });
    // });
    
    //moods
    app.get("/happy", function (req, res) {
      console.log("mood = happy")
      username = "user 1";
      mood = "happy";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMoodref = moodRef.child(username).child(currentDate).child("mood");
      var userMood = moodRef.child(username).child(currentDate)

      moodRef.child(username).child(currentDate).child("mood").once('value')
        .then((querySnapshot) => {
          if (!querySnapshot.numChildren()) { // handle rare no-results case
            var newMood = userMood.push();            
            newMood.set({ //set the data with id    
              mood: {
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                }
              });
          }
          if (querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
            userMoodref.update({ //set the data with id    
              
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                
              });
          }
        });
      
      // console.log(newMood);
      res.redirect('back');
    });
  
    app.get("/mad", function (req, res) {
      console.log("mood = mad")
      username = "user 1";
      mood = "mad";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMoodref = moodRef.child(username).child(currentDate).child("mood");
      var userMood = moodRef.child(username).child(currentDate)

      moodRef.child(username).child(currentDate).child("mood").once('value')
        .then((querySnapshot) => {
          if (!querySnapshot.numChildren()) { // handle rare no-results case
            var newMood = userMood.push();
            newMood.set({ //set the data with id    
              mood: {
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                }
              });
          }
          if (querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
            userMoodref.update({ //set the data with id    
              
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                
              });
          }
        });
      
      // console.log(newMood);
      res.redirect('back');
    });
    app.get("/sad", function (req, res) {
      console.log("mood = sad")
      username = "user 1";
      mood = "sad";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMoodref = moodRef.child(username).child(currentDate).child("mood");
      var userMood = moodRef.child(username).child(currentDate)

      moodRef.child(username).child("another date").child("mood").once('value')
        .then((querySnapshot) => {
          if (!querySnapshot.numChildren()) { // handle rare no-results case
            var newMood = userMood.push();
            newMood.set({ //set the data with id    
              mood: {
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                }
              });
          }
          if (querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
            userMoodref.update({ //set the data with id    
              
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                
              });
          }
        });
      
      // console.log(newMood);
      res.redirect('back');
    });
    app.get("/cool", function (req, res) {
      console.log("mood = cool")
      username = "user 1";
      mood = "cool";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMoodref = moodRef.child(username).child(currentDate).child("mood");
      var userMood = moodRef.child(username).child(currentDate)

      moodRef.child(username).child("another date").child("mood").once('value')
        .then((querySnapshot) => {
          if (!querySnapshot.numChildren()) { // handle rare no-results case
            var newMood = userMood.push();
            newMood.set({ //set the data with id    
              mood: {
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                }
              });
          }
          if (querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
            userMoodref.update({ //set the data with id    
              
                username: "user 1",
                mood: mood,
                currentTime: currentDate
                
              });
          }
        });
      
      // console.log(newMood);
      res.redirect('back');
    });
    app.get("/neutral", function (req, res) {
      console.log("mood = neutral")
      username = "user 1";
      mood = "neutral";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear(); 
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate);
      userMood.once('value') 
        .then((querySnapshot) => {
          if (querySnapshot.exists() == "") { // handle rare no-results case
            // console.log(querySnapshot)
           var newMood = userMood.push();
            newMood.set({ //set the data with id    
            
                username: "user 1",
                mood: mood,
                currentTime: currentDate
              
            });
            console.log("user created")
          } 




          

          // if (querySnapshot.exists()) { // handle rare no-results case
          //   newMood.update({ //set the data with id    
              
          //       username: "user 1",
          //       mood: "mood",
          //       currentTime: currentDate
                
          //     });
          // }
          // } else {
          //   newMood.update({ //set the data with id    
              
          //       username: "user 1",
          //       mood: "mood",
          //       currentTime: currentDate
                
          //     });
          // }
          
          // if (querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
          //   userMoodref.update({ //set the data with id    
              
          //       username: "user 1",
          //       mood: mood,
          //       currentTime: currentDate
                
          //     });
          // }
        });
      
      // console.log(newMood);
      res.redirect('back');
    });
      
    app.get("/mood_calendar", function (req, res) {
      res.render("mood_calendar.html", {
        title: "Dynamic title"
      });
    });
  }
