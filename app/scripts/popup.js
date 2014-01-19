'use strict';

$(document).ready(function() {
	$('#button').click(function(){
		chrome.runtime.sendMessage({
    		value: $('#timeframe').val(),
    		lang: $('#language').val(),
    		turnMeOn: $('#isEnable').val(),
    		type: "difficulty"
    	});

	});
});


