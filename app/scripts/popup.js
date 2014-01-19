'use strict';

$(document).ready(function() {
	$('#button').click(function(){
		chrome.runtime.sendMessage({
    		value: $('#timeframe').val(),
    		lang: $('#language').val(),
    		type: "difficulty"
    	});

	});
});


