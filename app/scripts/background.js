'use strict';
var timeToken;
var accToken;
var known_words = {}
var known_words_college = {}

var difficulty = false;
var language = "zh-TW";


// read in high school word list
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function(){
    if (xhr.readyState != 4)
        return;
    var w = JSON.parse(xhr.responseText);
    for (var i in w.words) {
      known_words[stemmer(w.words[i])] = 1;
    }
}
xhr.open("GET", chrome.extension.getURL('/words/highschool.json'), true);

xhr.send();


// read in 4 level word list
var xhr2 = new XMLHttpRequest();
xhr2.onreadystatechange = function(){
    if (xhr2.readyState != 4)
        return;
    var w = JSON.parse(xhr2.responseText);
    for (var i in w.words) {
      known_words_college[stemmer(w.words[i])] = 1;
    }
}
xhr2.open("GET", chrome.extension.getURL('/words/4level.json'), true);
xhr2.send();



//see if it's english word
function is_english(word) {
  for (var i = 0; i < word.length; i ++) {
    if ((word[i] >= 'a' && word[i] <= 'z') ||
      (word[i] >= 'a' && word[i] <= 'z')) {
    } else {
      return false;
    }
  }
  if (word.length <= 5)
    return false;
  return true;
}

//communication

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});


function getToken(callback) {
	var timeNow = new Date();

	if (!timeToken || timeNow-timeToken > 600000) {
		var client_id = "msne";
		var client_secret ="Y0bN/QOAUerNYpqBAgao2MJzD/uBplfth5P7XrqiwQo=";
		var scope = "http://api.microsofttranslator.com";
		var grant_type = "client_credentials";
		var request = "client_id=msne&client_secret="+encodeURIComponent(client_secret)+"&scope="+encodeURIComponent(scope)+"&grant_type=client_credentials";
		var token;
		var xhr = new XMLHttpRequest();

		xhr.open("POST", "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13", true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status==200) {
				token = JSON.parse(xhr.responseText);
				timeToken = new Date();

				accToken = token.access_token;
				callback(accToken);
			}
		}
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(request);
	}
	else {
		callback(accToken);
	}
}

function translate(text, callback) {
	getToken(function(token){
			var from = "en";
			var request = "http://api.microsofttranslator.com/v2/Http.svc/Translate?text=" + encodeURIComponent(text) + "&from=" + from + "&to=" + language;
			var authToken = "Bearer " + token;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", request, true);
			xhr.setRequestHeader("Authorization", authToken);
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4 && xhr.status == 200) {
					var response = xhr.responseText;
					var response_parse_half = response.substring(response.indexOf(">")+1);
					var translated = response_parse_half.substring(0, response_parse_half.indexOf("<"));
					callback(translated);
				}
			}
			xhr.send();

		}
	);
}

function breakup(request, callback) {
	var words = request.text.split(" ");
	var sum = (1+words.length)*words.length/2;
	var accum = 0;
	for(var i=0; i < words.length;i++){
		(function(i){
			if (is_english(words[i]) && !known_words[stemmer(words[i])]
				&& ((difficulty && !known_words_college[stemmer(words[i])]) || !difficulty)
				) {
				translate(words[i], function(translated){
				words[i] = words[i] + "(" + translated + ")";
				accum = accum+i+1;
				if(accum == sum) {
					callback(words);
				}
				});
			} else {
				accum = accum+i+1;
				if(accum == sum) {
					callback(words);
				}
			}

		})(i);
	}
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if(request.type == "difficulty") {
  		if (request.value == "college") {
  			difficulty = true;
  		}
  		else {
  			difficulty = false;
  		}
  		language = request.lang;
  		chrome.tabs.getSelected(null, function(tab) {
  			var code = 'window.location.reload();';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});
  	} 
  	else {
  	breakup(request, function(words){
  		sendResponse({text: words.join(" ")});

  	});
  	return true;
  	}
  }
);


