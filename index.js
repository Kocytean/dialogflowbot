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

restService.post("/qhrbot", function(req, res) {

	var query = req.body.queryResult;
	// console.log(query)
	var action = query.action
	var speech = ""

	switch (action){
		case "Compliance.Frequency":
			var ok = req.body.queryResult &&
					req.body.queryResult.outputContexts[0].parameters &&
					req.body.queryResult.outputContexts[0].parameters.Topic;
			speech = !ok
					? "You will need to take the tests as soon as you onboard. This test should be done once every year for PoSH and 6 months for InfoSec. "
					:  req.body.queryResult.outputContexts[0].parameters.Topic === "PoSH"
					? "You will need to take the test as soon as you onboard. This test should be done once every year."
					: "You will need to take the test as soon as you onboard. Post 6 months you need to take it again.";
			break;
		case "Compliance.Passperc":
			var ok = req.body.queryResult &&
					req.body.queryResult.outputContexts[0].parameters &&
					req.body.queryResult.outputContexts[0].parameters.Topic;
			speech = !ok
					? "The passing percentage for PoSH is 85% and for InfoSec 80% "
					:  req.body.queryResult.outputContexts[0].parameters.Topic === "PoSH"
					? "85% is the pass percentage, You will need to retake the test till you score above 85%"
					: "80% is the pass percentage, You will need to retake the test till you score above 80%";
			break;
		case "Compliance.Duration":
			var ok = req.body.queryResult &&
					req.body.queryResult.outputContexts[0].parameters &&
					req.body.queryResult.outputContexts[0].parameters.Topic;
			speech = !ok
					? "The InfoSec test takes about 5 minutes, while the PoSH test usually takes 3 hours with a stable internet connection as there are videos which are a part of the training."
					:  req.body.queryResult.outputContexts[0].parameters.Topic === "PoSH"
					? "This usually takes 3 hours if you have a stable internet connection as there are videos which are a part of the training."
					: "This usually takes about 5 minutes if you have a stable internet connection";
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
		//data: speechResponse,
		fulfillmentText: speech,
		speech: speech,
		displayText: speech,
		source: "qhrbot"
	});
});

restService.listen(process.env.PORT || 8000, function() {
	console.log("Server up and listening");
});
