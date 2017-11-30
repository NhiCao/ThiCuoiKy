var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/shuffledWord";

var vocabs = ["home", "water", "sky", "love", "cloud", "computer", "parent",
              "black", "raise", "responsibility", "meal", "cook", "peace", "family", 
              "dad", "flower", "beautiful", "road", "country", "world", "life", "money",
              "start", "drink", "red", "children", "book", "food", "fruit", "green",
              "house", "health", "brother", "tail", "graduate", "university", "believe", 
              "boy", "girl", "cycle", "library", "friend", "busy", "yellow", "milk", "company",
              "white", "birth", "all", "head", "mother", "finish", "eat", "school", "teacher",
              "learn", "study", "weekend", "begin", "sound", "spring", "summer", "normal",
              "different", "language", "business", "program", "technology", "sister",
              "information", "science", "give", "take", "power", "trouble", "father",
              "sick", "really", "lake", "find", "blue", "morning", "keep", "play", "run",
              "hug", "plant", "record", "song", "river", "cat", "stop", "number", "that",
              "rich", "lemon", "out", "little", "winter", "read", "fun", "happy", "rule",
              "simple", "much", "public", "wait", "bag", "future", "orange", "class",
              "real", "push", "door", "people", "soul", "now", "vocabulary", "function",
              "crazy", "screen", "space", "back", "object", "time", "you", "get", "go",
              "if", "dinner", "boat", "fly", "what", "work", "line", "nice", "row",
              "key", "mouse", "dress", "rain", "hope", "sad", "past", "view", "help"];

var vocabs1 = [];

MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    // var i = 0;
    // var len = vocabs.length;
    // for(i = 0; i < len; i++){
    // 	var myobj = { vocabulary: vocabs[i] };
    // 	db.collection("vocabulary").insertOne(myobj, function(err, res) {
	   //  	if (err) throw err;
	   //  	//console.log("insert: " + vocabs[i]);   	
    // 	});
    // }   

    // db.collection("vocabulary").find().toArray(function(err, result) {
	   //  if (err){
	   //  	console.log("loi ne_____" + err);
	   //  	console.log("______");
	   //  }
	   //  else{
	   //  	console.log(result);
	   //  	console.log(result.length);
	   //  }
	   //  db.close();
    // });

    var vocs = [];
    db.collection("vocabulary").find({},{ _id: false }).toArray(function(err, result) {
	    if (err) throw err;
	    for(var i = 0; i < result.length; i++){
	    	vocs.push(result[i].vocabulary);
	    	console.log("___" + vocs[i]);
	    }
	    db.close();
  	});

    //console.log(vocs.length);


    // var query = { vocabulary: "dress" };
    // db.collection("vocabulary").find(query).toArray(function(err, result) {
	   //  if (err) throw err;
	   //  console.log(result);
    // });

 //    var myobj = { vocabulary: vocabs[0] };
 //    db.collection("vocabulary").insertOne(myobj, function(err, res) {
 //    	if (err) throw err;
 //    	console.log("insert ok");   	
	// });


	// db.collection("vocabulary").drop(function(err1, delOK) {
		
 //    });

    //db.close();
});

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/mydb";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });