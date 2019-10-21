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

	var action = req.body.queryResult
				? req.body.queryResult.action
				: "InvalidRequest"

	var speech = ""
	var posh_bool = false;
	var infs_bool = false;
	var both = false
	req.body.queryResult.outputContexts.forEach(function(oc) {
		var okk =  oc.parameters && oc.parameters.Topic;
		posh_bool = posh_bool|| (okk&& oc.parameters.Topic==="PoSH") || oc.name.indexOf("posh")!=-1;
		infs_bool = infs_bool|| (okk&& oc.parameters.Topic==="InfoSec") || oc.name.indexOf("infosec")!=-1;
		
		both = posh_bool==infs_bool;
	});

	switch (action){
		case "Compliance.Frequency":
			

			speech = both
				? "You will need to take the tests as soon as you onboard. These tests should be done once every year for PoSH and 6 months for InfoSec. "
				:  posh_bool
				? "You will need to take the test as soon as you onboard. This test should be done once every year."
				: "You will need to take the test as soon as you onboard. Post 6 months you need to take it again.";
			break;
		case "Compliance.Passperc":
			
		
			speech = both
				? "The passing percentage for PoSH is 85% and for InfoSec 80% "
				:  posh_bool
				? "85% is the pass percentage, You will need to retake the test till you score above 85%"
				: "80% is the pass percentage, You will need to retake the test till you score above 80%";
			break;

		case "Compliance.Duration":
			
			speech = both
				? "The InfoSec test takes about 5 minutes, while the PoSH test usually takes 3 hours with a stable internet connection as there are videos which are a part of the training."
				:  posh_bool
				? "This usually takes 3 hours if you have a stable internet connection as there are videos which are a part of the training."
				: "This usually takes about 5 minutes if you have a stable internet connection";
			break;
			
		case "Compliance.WhatIs":
			
			speech = oc.name.indexOf("posh")!=-1
				? "The Prevention of Sexual Harassment (POSH) policy is implemented by a company to create and maintain safe work environment, free from sexual harassment and discrimination for all of its employees. It follows the guidelines and regulations laid down by the “Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013” and prohibits any act of sexual harrassment or related retaliation against or by any employee."
				:  oc.name.indexOf("infosec")!=-1;
				? "<Insert about infosec>"
				: "Context not available";
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
