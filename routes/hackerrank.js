var express = require('express');
var router = express.Router();
//Example POST method invocation
var request = require("request");


router.post('/', function(req, res, next) {
    var key = "hackerrank|552846-738|a0cbb40c1f9611d6090f6665f59e5259c85f6059";
    var sub_url = "http://api.hackerrank.com/checker/submission.json";
    //var sub_url = "http://localhost:8001/hackerrank"

    var source = req.body['source'];
    var lang = req.body['lang'];
    var testcases = req.body['testcases'];
    
    var options = { 
        method: 'POST',
        url: sub_url,
        headers: 
        { 
            'content-type': 'application/x-www-form-urlencoded',
            'postman-token': 'c60746c8-506b-e373-4389-b971a7224fa0',
            'cache-control': 'no-cache' 
        },
        form: 
        {
            api_key: key,
            lang: lang,
            testcases: testcases,
            source: source,
            format: 'json' 
        } 
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        //console.log(body);
        res.json(body);
    });

});

module.exports = router;



