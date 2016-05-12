$(document).ready(function(){
	$('#start-interview-button').click(function(){
		console.log("Start Interview Modal launch");
		$('#modal1').openModal();
	});

	$('#createroom').click(function() {
		data = {  "first_name" : $("#first_name").val(),
		"profile" : $("#profile").val(),
		"email" : $("#email").val()};
		// alert(JSON.stringify(data));
		$.ajax({url: "createroom",
			data: data,
			method : "post",
			success: function(result){
				console.log(result);
				if (result.status === true) {
					window.location.href = "/room";
				} else {
					swal("", result.message, "error");
					// alert(result.message);
					// formLogin.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
				}
			}
		});
	});
})