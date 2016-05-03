$('document').ready(function(){
	console.log('Ready!');

	var backColor = '#272822';

	button = $('#swapButton');
	codeboard = $('#codeboard');
	drawboard = $('#drawboard');
	swapperCont = $('#swapperDiv')

	button.on('click',function(event) {
		console.log("SWAP!");
		if (codeboard.is(':visible')) {
			// codeboard.hide();
			codeboard.slideUp("slow",function(){
				// swapperCont.css("background-color","inherit");
				swapperCont.animate({backgroundColor: 'inherit'}, 'slow');
			});

			button.html("code");
		}
		else {
			swapperCont.css("background-color",backColor);
			codeboard.slideDown();
			button.html("aspect_ratio");
		}
		
	});

})