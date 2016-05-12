$('document').ready(function(){
	console.log('Ready!');

	var backColor = '#272822';

	button = $('#swapButton');
	codeboard = $('#codeboard');
	drawboard = $('#drawboard');
	swapperCont = $('#swapperDiv');
	canvas = $('#canvas');
	canvaspanel = $('#canvasPanel');
	canvasDiv = $('#canvasDiv')
	// canvas.css("width","100%");
	// console.log("YO"+canvas.width());

	var wh = $(window).height();
	var navh = $('nav').height();
	var codeFlag = true;

	console.log(wh+" "+navh);

	// $('.outer-container').css('height',wh-navh);
	// $('.inner-container').css('height',wh-navh);
	// $('.CodeMirror').css('height',600+'');
	$('.outer-container').height(wh-navh);
	$('.inner-container').height(wh-navh);
	$('.CodeMirror').height(200);



	// Set column heights



	console.log($('#mid-col').width());
	canvas.attr("width",$('#mid-col').width());
	canvaspanel.hide();
	// canvas.attr("class","LOL");

	button.on('click',function(event) {
		console.log("SWAP!");
		if (codeboard.is(':visible')) {
			// codeboard.hide();
			codeboard.slideUp("slow",function(){
				// canvasDiv.show();
				canvaspanel.fadeIn();
				// swapperCont.css("background-color","inherit");
				// swapperCont.animate({backgroundColor: 'inherit'}, 'slow');
			});
			codeFlag = false;
			button.html("code");
		}
		else {
			// swapperCont.css("background-color",backColor);
			canvaspanel.fadeOut();
			// canvasDiv.hide();
			codeboard.slideDown();
			codeFlag = true;
			button.html("aspect_ratio");
		}
		console.log(codeFlag);
	});

	$('#invite').click(function(e) {
		swal({
			title: "Invite interviewee",
			text: "Enter email address:",
			type: "input",   showCancelButton: true,
			closeOnConfirm: false,
			animation: "slide-from-top",
			inputPlaceholder: "Email" },
			function(inputValue){
				if (inputValue === false)
					return false;
				if (inputValue === "") {
					swal.showInputError("Please enter an email!");
					return false;
				}
				$.post("/invite",
			    {
			        email: inputValue,
			        peerid: $('#my-id').text()
			    },
			    function(data, status){
			        if (data.status == false) {
			        	swal("", data.message, "error");
			        } else {
			        	swal("", "Invite sent successfully", "success");
			        }
			    });
			});	
	});
	document.getElementById('imageLink').onclick = function() {
		if(codeFlag){
			document.getElementById('imageLink').download = 'code.txt';
			var code = compilerController.getCode();
		    console.log(code);
		    this.href = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(code);
		}
		else
		{
			document.getElementById('imageLink').download = 'whiteBoard.png';
			var dataURL = canvas.toDataURL('image/png');
	    	this.href = dataURL;
		}
	    
	  };

})