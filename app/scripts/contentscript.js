'use strict';

var str = "";

function update_text(response, element) {
	console.log(response.text);
	element.nodeValue = response.text;
}

$(document).ready(function(){
    $('*').each(function(){
    	$(this).contents().each(function() {
    		var x = this;
    		if (this.nodeType === 3) { // 3 = text node
    			chrome.runtime.sendMessage(
      				{text: this.nodeValue},
      				function (response) {
      					//console.log(response.text);
      					x.nodeValue = response.text;
      				}
				);
      		}
  		});
	});
});

/*
chrome.runtime.sendMessage({dom: document}, function(response) {
  console.log(response.farewell);
});
*/



