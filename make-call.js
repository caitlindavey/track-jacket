const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER

const client = require('twilio')(accountSid, authToken)

client.calls.create({
	url: 'http://demo.twilio.com/docs/voice.xml',
	to: '+16466686051', 
	from: twilioNumber
}, function(err, call){
	if(err){
		console.log(err)
	}
	else { 
		console.log(call.sid)
	}
})