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
	req.body.queryResult.outputContexts.forEach(function(oc) {
		var okk =  oc.parameters && oc.parameters.Topic;
		posh_bool = posh_bool|| (okk&& oc.parameters.Topic==="PoSH") || oc.name.indexOf("posh")!=-1;
		infs_bool = infs_bool|| (okk&& oc.parameters.Topic==="InfoSec") || oc.name.indexOf("infosec")!=-1;
		
	});
	var both = (posh_bool&&infs_bool) || !(posh_bool||infs_bool);

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
		case "Compliance.StudyMaterial":
			
			speech = both
				?"You will find relevant material in the Files section on Zoho. (You can use the filter feature in the top right to search for files by name.)" 
				:  posh_bool
				? "New joiners must go through the video tutorial that outlines the basic aspects of the topic, while employees taking the refresher test can directly proceed to the test. Links for both will be available in the “Quick Links” section in Zoho People."
				: "You will find relevant material in the Files section on Zoho. (You can use the filter feature in the top right to search \"Information Security User Awareness\")";
			break;

		case "Compliance.Test":

			posh_bool = false;
			infs_bool = false;
			req.body.queryResult.outputContexts.forEach(function(oc) {
				posh_bool = posh_bool|| oc.name.indexOf("posh")!=-1;
				infs_bool = infs_bool|| oc.name.indexOf("infosec")!=-1;
				
				
			});
			both = (posh_bool&&infs_bool) || !(posh_bool||infs_bool);
			speech = infs_bool
				? "Please choose from the following categories that you want to know about InfoSec test:\n- About InfoSec test\n- Preparation\n- Test guidelines\n- Test errors" 
				:  "Please choose from the following categories that you want to know about PoSH test:\n- About PoSH test\n- Preparation\n- Test guidelines\n- Errors" ;
			break;

		case "Compliance.WhatIs":
			posh_bool = req.body.queryResult.parameters.Topic? req.body.queryResult.parameters.Topic ==="PoSH": false;
			infs_bool = req.body.queryResult.parameters.Topic? req.body.queryResult.parameters.Topic ==="InfoSec": false;

			var about_test_bool = req.body.queryResult.parameters.Test? true:false;
			var quant_bool = req.body.queryResult.parameters.Quantiphi? true:false;
			if (quant_bool){
				speech = posh_bool
					? "Quantiphi Analytics is committed to ensuring that the work environment at all locations of the organisation is fair, safe and harmonious. The company strives to create a safe and welcoming environment even for those who visit our premises, such as customers, vendors and others. Discrimination and harassment of any type is strictly prohibited. Every organization with more than 50 or more employees needs to establish an Internal Complaints Committee (ICC). Even though the act states it is for women, any employee- male or female, should not hesitate to reach out to the respective committee member from the HR Team. For more details about the committee or complaint procedure, please refer to the Prevention of Sexual Harassment Policy available under the “FIles” section on Zoho."
					: infs_bool
					? "Quantiphi is highly committed to having the necessary regulations in place to protect its Intellectual property,  We expect all of our employees to strictly adhere to said regulations as it helps in avoiding any potential cyber theft. Legal consequences of non-compliance will depend on the sensitivity of the data leaked."
					: "Context not available";
				break;
			} else if(about_test_bool){
				speech = posh_bool
					? "POSH test contains an online video training followed by a test of 18 questions having a cumulative duration of approximately 3 hours. The video tutorial is mandatory for all new joiners. Employees taking the course as a refresher can directly take the test, which takes approximately 10-15 minutes to complete. This is a Mandatory Compliance Test and needs to be attempted in a timely manner once every year. 85% is the pass threshold; you will need to retake the test till you score above 85%."
					: infs_bool
					? "This is a 5 minute test that every employee needs to appear for as soon he/she onboards. The test score is valid only for a period of 6 months and you will receive a mailer for compulsorily retaking the test once the said period is over. You must score greater than 80% to pass this test, failing to do so will need you to retake the test till you score more than 80%. This is a Mandatory Compliance Training and needs to be finished in the right manner in the given timeframe."
					: "Context not available";
				break;
			} else 
			
			
			speech = posh_bool
				? "The Prevention of Sexual Harassment (POSH) policy is implemented by a company to create and maintain safe work environment, free from sexual harassment and discrimination for all of its employees. It follows the guidelines and regulations laid down by the “Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013” and prohibits any act of sexual harrassment or related retaliation against or by any employee."
				: infs_bool
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
