//Variables
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded; 

//Server
const app = express();
app.use(urlencoded({ extended:false }));

const sendResponse = (response, twiml) => {
	response.type('text/xml');
	response.send(twiml.toString());
}

//Post phone call 
app.post('/voice', (request, response) => {
	const twiml = new VoiceResponse();
	twiml.say({voice: 'Polly.Amy'}, "Hello! To celebrate all things big and small, we'll deliver a BIG congratulations speech for you.");
	twiml.pause({
    length: 3
	});
	//gather input from user
	const gatherNode = twiml.gather({ 
		input: 'speech',
		profanityFilter: true,
		timeout: 3,
		action: '/completed'
	});
	gatherNode.say({voice: 'Polly.Amy'},"To get started please say your name:");
	
	//If the user doesn't enter any input 
	twiml.redirect('/voice');

	sendResponse(response, twiml);
}); 

app.post('/completed', (request, response) => {

	const twiml = new VoiceResponse();
	const callerName = request.body.SpeechResult;

	const gatherNode = twiml.gather({ 
		input: 'speech',
		profanityFilter: true,
		action: '/deliver'
	});
	gatherNode.say({voice: 'Polly.Amy'},`Thanks, ${callerName}. Now what was it you did?`);

	twiml.redirect('/completed');

	sendResponse(response, twiml);
});

app.post('/deliver', (request, response, callerName) => {

	const twiml = new VoiceResponse();
	const accomplishment = request.body.SpeechResult;

	twiml.play('https://files.mattbutterfield.com/celebration.mp3');

	twiml.say({voice: 'Polly.Amy'}, `You did it! It is an honor to address you today because despite all the odds you persevered and you ${accomplishment}. In the words of Les Brown, “Shoot for the moon. Even if you miss, you’ll land amongst the stars.” Whether you’re basking in the moon’s glow or swimming amongst the stars, know that you did it. I hope  you take time to celebrate yourself today for boldly charting your path forward to success.`);
	
	//Replay or hang-up
	const gather = twiml.gather({
		numDigits: 1,
		action: '/gather',
	});
	gather.say({voice: 'Polly.Amy'},`To revel in your accomplishment once more press 1. To hangup, press 2.`);

	sendResponse(response, twiml);
});

app.post('/gather', (request, response) => {
	const twiml = new VoiceResponse();
	
	if (request.body.Digits) {
		switch (request.body.Digits) {
			case '1': 
				twiml.say({voice: 'Polly.Amy'}, `Ok, one more time! You did it! Woooooo!`);
	        	break;
		    case '2':
		   		twiml.say({voice: 'Polly.Amy'},`Goodbye!`);
		   		twiml.hangup();
		   		break;
		}

	} else {
		twiml.say({voice: 'Polly.Amy'},`Thanks so much for stopping by, I think this is farewell!`);
   		twiml.hangup();
	}
	sendResponse(response, twiml);
});

//render the response as XML in reply to the webhook request -- is this the right place for this? 
console.log('Twilio client app http server running at http://127.0.0.1:3000');
app.listen(3000);