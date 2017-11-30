var express = require('express'),
    app = express();
var http = require( "http" ).createServer( app );
var io = require( "socket.io" )( http );

app.use(express.static(__dirname + ''));


var playerSockets = [];				//mảng chứa socket của những người chơi trong phong
var userList = [];					//mảng chứa thông tin của user trong phòng
var rankList = [];					//mảng chứa vị thứ của user
var MaxNumberOfClient = 2;			//số người chơi tối đa
var DefaultTime = 60;

var vocIndex = 0;
var vocArrStartIndex = 0;

var playing = 0;					//1 khi đang chơi, 0 khi dừng chơi

// var vocabs1 = ["home", "water", "sky", "love", "cloud", "computer", "parent",
//               "black", "raise", "responsibility", "meal", "cook", "peace", "family", 
//               "dad", "flower", "beautiful", "road", "country", "world", "life", "money",
//               "start", "drink", "red", "children", "book", "food", "fruit", "green",
//               "house", "health", "brother", "tail", "graduate", "university", "believe", 
//               "boy", "girl", "cycle", "library", "friend", "busy", "yellow", "milk", "company",
//               "white", "birth", "all", "head", "mother", "finish", "eat", "school", "teacher",
//               "learn", "study", "weekend", "begin", "sound", "spring", "summer", "normal",
//               "different", "language", "business", "program", "technology", "sister",
//               "information", "science", "give", "take", "power", "trouble", "father",
//               "sick", "really", "lake", "find", "blue", "morning", "keep", "play", "run",
//               "hug", "plant", "record", "song", "river", "cat", "stop", "number", "that",
//               "rich", "lemon", "out", "little", "winter", "read", "fun", "happy", "rule",
//               "simple", "much", "public", "wait", "bag", "future", "orange", "class",
//               "real", "push", "door", "people", "soul", "now", "vocabulary", "function",
//               "crazy", "screen", "space", "back", "object", "time", "you", "get", "go",
//               "if", "dinner", "boat", "fly", "what", "work", "line", "nice", "row",
//               "key", "mouse", "dress", "rain", "hope", "sad", "past", "view", "help"];


var vocabs1 = [];
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/shuffledWord";


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("ket noi mongodb ok");
    db.collection("vocabulary").find({},{ _id: false }).toArray(function(err, result) {
	    if (err) throw err;
	    for(var i = 0; i < result.length; i++){
	    	vocabs1.push(result[i].vocabulary);
	    	//console.log("___" + vocabs2[i]);
	    }
	    //for(var i = 0; i < 10; i++){
		//	console.log("___||___" + vocabs1[i]);
		//}
		


		var Vocabulary = getVoc();			//1 mảng chứa các đối tượng là từ vựng, 1 object gồm có từ vừng, từ đã xáo trộn và gợi ý
		var gameTimer;						//biến timer của game
		var numOfPlayer = 0;				//số người chơi

		function getVoc(){
			var vList = [];
			for(var i = 0 ; i < 7; i++){
				var voc = vocabs1[vocIndex];
				var shuffled = voc;
				while (shuffled === voc){
					shuffled = voc.split('').sort(function(){return 0.5-Math.random()}).join('');
				}
				vList.push({
					vocabulary : voc,
					shuffledVoc : shuffled,
					hint : ""
				});
				vocIndex = vocIndex < vocabs1.length-1 ? vocIndex+1 : 0;
			}
			return vList;
		}

		// ham remove phan tu trong mang vocabulary
		// input : tu vung
		function removeVoc(VocList,voc){
			var index = 0;
			while(index <VocList.length && VocList[index].vocabulary != voc) index++;
			if(index < VocList.length){
				VocList.splice(index,1);
			}	
		}

		io.on('connection', function(clientsocket){
			clientsocket.on('setUserName',function(userName){
				if(playing == 0 && playerSockets.length < MaxNumberOfClient){
					console.log("setUserNAme " + userName);
					//them client vao danh sach nguoi choi
					var index = 0;
					while(index < userList.length && userName!==userList[index].userName) index++;
					if(index >= userList.length){
						playerSockets.push(clientsocket);
						userList.push({
							userName : userName,
							time : DefaultTime,
						});
						rankList.push[-1];
						clientsocket.emit("userNameOK");
						io.emit("msg",userName + " has joined, " + playerSockets.length  + " players in room");
					}else{
						clientsocket.emit("msg","UserName has been used!!!");
					}
				}else{
					clientsocket.emit("msg","The room is full, please wait!!!");
				}
			});

			clientsocket.on('match', function(voc){
				removeVoc(Vocabulary,voc);
				if(Vocabulary.length==0){
					Vocabulary = getVoc();
				}
				io.emit("setVocList",Vocabulary);	

				var index = playerSockets.indexOf(clientsocket);
				console.log(index + "  match")
				if(index >-1 && index < playerSockets.length){
					userList[index].time += voc.length;
					for(var j = 0; j<playerSockets.length;j++){
						playerSockets[j].emit("setUserList",userList);
					}
				}
			});
			clientsocket.on('ready',function(){
				var index = playerSockets.indexOf(clientsocket);
				if(index > -1 && index < userList.length){
					clientsocket.emit("setUserName",userList[index].userName);	
					if(playing==0 && playerSockets.length == MaxNumberOfClient){
						io.emit("msg","start game");
						for(var i = 0; i<playerSockets.length;i++){
							socket = playerSockets[i];


							socket.emit("setUserList",userList);
							socket.emit("setVocList",Vocabulary);
							
							socket.emit("start");
							console.log("Start game");
						}
						
						var index = 0;
						numOfPlayer = MaxNumberOfClient;
						gameTimer = setInterval(function(){
							for(var i = 0 ; i<userList.length ; i++){
								if(userList[i].time>0){
									userList[i].time--;
								}else if(userList[i].time == 0){
									userList[i].time= -1;
									playerSockets[i].emit("stop");
									console.log(i + " __stop");
									rankList[i] = numOfPlayer;
									numOfPlayer--;
									if(numOfPlayer==0 && playing == 1){
										console.log("stop game");
										
										io.emit("msg","stop game");

										for(var ii = 0;ii<playerSockets.length ; ii++){
											var rankL = [];
											for(var k = 0;k<userList.length;k++){
												rankL.push({
													userName : userList[k].userName,
													rank : rankList[k]
												});
											}
											rankL.sort(function(a,b){
												return a.rank - b.rank;
											});
											playerSockets[ii].emit("rankList",rankL);
										}

										playing = 0;
										playerSockets = [];
										userList = [];
										rankList = [];
										Vocabulary = getVoc();
										clearInterval(gameTimer);
									}
								}
							}
							for(var i = 0; i<playerSockets.length;i++){
								var socket = playerSockets[i];
								socket.emit("setUserList",userList);
							}
							// console.log(index++);
						}, 1000);	
						playing = 1;
					
					}else{
					}
				}
			});
		});

		http.listen(8088, "127.0.0.1");


	    db.close();
  	});

});



