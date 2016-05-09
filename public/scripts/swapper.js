$('document').ready(function(){
	console.log('Ready!');

	var backColor = '#272822';

	button = $('#swapButton');
	codeboard = $('#codeboard');
	drawboard = $('#drawboard');
	swapperCont = $('#swapperDiv');
	canvas = $('#canvas');
	canvaspanel = $('#canvasPanel');
	// canvas.css("width","100%");
	// console.log("YO"+canvas.width());
	console.log($('#mid-col').width());
	canvas.attr("width",$('#mid-col').width());
	canvaspanel.hide();
	// canvas.attr("class","LOL");

	button.on('click',function(event) {
		console.log("SWAP!");
		if (codeboard.is(':visible')) {
			// codeboard.hide();
			codeboard.slideUp("slow",function(){
				canvaspanel.fadeIn();
				// swapperCont.css("background-color","inherit");
				// swapperCont.animate({backgroundColor: 'inherit'}, 'slow');
			});

			button.html("code");
		}
		else {
			// swapperCont.css("background-color",backColor);
			canvaspanel.fadeOut();
			codeboard.slideDown();
			button.html("aspect_ratio");
		}
		
	});

})