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
		channelData("output" , str);
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
		
		response = JSON.parse(response);
		var compileMssg = response['result']['compilemessage'];
		var str = null;
		if(compileMssg.length > 0)
		{
			compilerView.setStatus("Compilation error");
			str = 'Compilation error ' + '\n\n';
		}
		else
		{
			var statusMssg = response['result']['message'];
			var output = response['result']['stdout'][0];
			str = " --- " + statusMssg + " ---\n" + output ;
		}
		compilerView.setOutput(str);
		channelData("output" , str);
	},
	changeMode : function(){
		var value = compilerView.getLanguage();
		var modetype = this.langList[value][1];
		compilerView.setMode(modetype);
		channelData("mode",value);
	},
	setMode : function(value){
		compilerView.setLanguage(value);
		var modetype = this.langList[value][1];
		compilerView.setMode(modetype);
	},
	setCompilerOutput : function(output){
		compilerView.setOutput(output);
	},
	getCode : function(){
		return compilerView.getContent();
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
	setLanguage : function(lang){
		$("#languageMenu").val(lang);
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
		console.log('mode changed to : ' + modetype);
	}
};

