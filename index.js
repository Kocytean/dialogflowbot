"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

restService.use(
	bodyParser.urlencoded({
		extended: true
	})
);

restService.use(bodyParser.json());

restService.post("/dfbot", function(req, res) {

	var action = req.body.queryResult
				? req.body.queryResult.action
				: "InvalidRequest"

	var speech = ""
	var param1_bool = false;
	var param2_bool = false;
	req.body.queryResult.outputContexts.forEach(function(oc) {
		var okk =  oc.parameters && oc.parameters.Topic;
		param1_bool = (okk&& oc.parameters.Topic==="param1") || oc.name.includes("param1");
		param2_bool = (okk&& oc.parameters.Topic==="param2") || oc.name.includes("param2");
		
	});

	switch (action){
		case "ActionCategory1.Action1":
			speech = param1_bool
				? "Response for ActionCategory1.Action1 if param1 was detected in the user entry"
				: "Response for ActionCategory1.Action1 if param1 was not detected in the user entry";
			break;
		case "ActionCategory1.Action2":
			speech = param2_bool
				? "Response for ActionCategory1.Action1 if param2 was detected in the user entry"
				: "Response for ActionCategory1.Action1 if param2 was not detected in the user entry";
			break;
		case "InvalidRequest":
			speech = "Invalid Request."
			break;
	}

	var speechResponse = {
		google: {
			expectUserResponse: true,
			richResponse: {
				items: [
					{
						simpleResponse: {
							textToSpeech: speech
						}
					}
				]
			}
		}
	};
	
	return res.json({
		payload: speechResponse,
		// data: speechResponse,
		fulfillmentText: speech,
		speech: speech,
		displayText: speech,
		source: "dialogflowbot"
	});
});

restService.post("/button1", function(req, res) {

	console.log(req);


});
restService.listen(process.env.PORT || 8000, function() {
	console.log("Server up and listening");
});
