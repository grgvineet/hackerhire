var compilerModel = {
	sub_url : null,
	init : function(){
		this.sub_url = window.location.protocol + "//" + window.location.host;
	},
	getSubUrl : function(){
		return this.sub_url;
	}
};

var compilerController = {
	langList : {
			"0" : [ "Text" , "text/plain"],
			"1" : [ "C" , "text/x-csrc"] ,
			"2" : [ "C++" , "text/x-c++src"],
			"3" : [ "Java" , "text/x-java"],
			"5" : [ "Python 2" , "text/x-python"],
			"6" : [ "Perl" , "text/x-perl"],
			"7" : [ "PHP" , "text/x-php"],
			"8" : [ "Ruby" , "text/x-ruby"],
			"9" : [ "C#" , "text/x-csharp"],
			"20" : [ "Javascript" , "text/javascript"]
		}, 
	init : function(){
		compilerModel.init();
		compilerView.init();
		this.addListeners();
	},
	runCode : function(endpoint){
		var code = compilerView.getContent();
		var input = compilerView.getInput();
		var lang = compilerView.getLanguage();
		var sub_url = compilerModel.getSubUrl() + '/hackerrank'; 
		var myData = {
		    'source': code,
		    'lang': lang,
		    'testcases': JSON.stringify([input]),
		};
		
		var str = " --- Running --- \n";
		compilerView.setOutput(str);
		//console.log(myData);

		//var str = '\n\n' + compilerView.getOutput();
		//compilerView.setOutput(str);
		$.post({
			url : sub_url ,
			dataType: "json",
			data :  JSON.stringify(myData, null, '\t'),
			contentType: 'application/json;charset=UTF-8',
			success: function(data){ compilerController.parseResponse(data);} 
		});
	},
	addListeners : function(){

	},
	parseResponse : function(response){
		
		//var data = JSON.parse(response);
		//alert(response);
		response = JSON.parse(response);
		//console.log(response);
		//console.log(response["result"]);
		var compileMssg = response['result']['compilemessage'];
		
		if(compileMssg.length > 0)
		{
			compilerView.setStatus("Compilation error");
			var str = 'Compilation error ' + '\n\n';
			compilerView.setOutput(str);
		}
		else
		{
			var statusMssg = response['result']['message'];
			var output = response['result']['stdout'][0];
			var str = " --- " + statusMssg + " ---\n" + output ;
			compilerView.setOutput(str);
			//compilerView.setStatus(statusMssg);
			//console.log(statusMssg.length);
			//console.log(output.length);
		}
	},
	changeMode : function(){
		var value = compilerView.getLanguage();
		var modetype = this.langList[value][1];
		compilerView.setMode(modetype);
	}
};

var compilerView = {
	myCodeMirror : null,
	init : function(){
		this.myCodeMirror = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
			lineNumbers: true,
		    matchBrackets: true,
		    styleActiveLine: true,
		    mode : "null",
			theme: "monokai"
		});
	},
	getContent : function(){
		return this.myCodeMirror.getValue();
	},
	getInput : function(){
		return $("#inputbox").val();
	},
	getLanguage  :function(){
		return $("#languageMenu").val();
	},
	getOutput : function(){
		return $("#outputbox").val();
	},
	setContent : function(content){
		$("#codeEditor").val(content);
	},
	setOutput : function(output){
		//console.log(output);
		$("#outputbox").val(output);
	},
	setStatus : function(status){
		$("#statusbox").val(status);
	},
	setMode : function(modetype){
		this.myCodeMirror.setOption("mode" , modetype);
		//CodeMirror.autoLoadMode(this.myCodeMirror , modetype);
		console.log('mode changed to : ' + modetype);
	}
};

