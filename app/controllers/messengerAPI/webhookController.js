const PAGE_ACCESS_TOKEN = process.env.PAGE_TOKEN;
const request = require("request")
function webhookController (){
 return{

webGet(req,res){

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.V_TOKEN;
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }


  }



    },
    // end of webGet method and start of index
index(req,res){
     // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        
        handlePostback(sender_psid, webhook_event.postback);
      }
      
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
    }
    // end of index method










    
    
}
}

// function handleMessage(sender_psid, received_message) {
//     let response;
    
//     // Checks if the message contains text
//     if (received_message.text) {    
//       // Create the payload for a basic text message, which
//       // will be added to the body of our request to the Send API
//       response = {
//         "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
//       }
//     } else if (received_message.attachments) {
//       // Get the URL of the message attachment
//       let attachment_url = received_message.attachments[0].payload.url;
//       response = {
//         "attachment": {
//           "type": "template",
//           "payload": {
//             "template_type": "generic",
//             "elements": [{
//               "title": "Is this the right picture?",
//               "subtitle": "Tap a button to answer.",
//               "image_url": attachment_url,
//               "buttons": [
//                 {
//                   "type": "postback",
//                   "title": "Yes!",
//                   "payload": "yes",
//                 },
//                 {
//                   "type": "postback",
//                   "title": "No!",
//                   "payload": "no",
//                 }
//               ],
//             }]
//           }
//         }
//       }
//     } 
    
//     // Send the response message
//     callSendAPI(sender_psid, response);    
//   }
  
  function handlePostback(sender_psid, received_postback) {
    console.log('ok')
     let response;
    // Get the payload for the postback
    let payload = received_postback.payload;
  
    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { "text": "Thanks!" }
    } else if (payload === 'no') {
      response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }
  
  function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message":{"text":response}
    }
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
        // console.log(`my message ${response}`);
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }

  // function firstTrait(nlp, name) {
  //   return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
  // }
  function firstTrait(nlp, name) {
    return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}
  
function handleMessage(sender_psid, message) {
  //handle message for react, like press like button
  // id like button: sticker_id 369239263222822

  if( message && message.attachments && message.attachments[0].payload){
      callSendAPI(sender_psid, "Thank you for watching my video !!!");
      callSendAPIWithTemplate(sender_psid);
      return;
  }

  let entitiesArr = [ "wit$greetings", "wit$thanks", "wit$bye" ];
  let entityChosen = "";
  entitiesArr.forEach((name) => {
      let entity = firstTrait(message.nlp, name);
      if (entity && entity.confidence > 0.8) {
          entityChosen = name;
      }
  });

  if(entityChosen === ""){
      //default
      callSendAPI(sender_psid,`The bot is needed more training, try to say "thanks a lot" or "hi" to the bot` );
  }else{
     if(entityChosen === "wit$greetings"){
         //send greetings message
         callSendAPI(sender_psid,'Hi there! This bot is created by Hary Pham. Watch more videos on HaryPhamDev Channel!');
     }
     if(entityChosen === "wit$thanks"){
         //send thanks message
         callSendAPI(sender_psid,`You 're welcome!`);
     }
      if(entityChosen === "wit$bye"){
          //send bye message
          callSendAPI(sender_psid,'bye-bye!');
      }
  }
}


module.exports = webhookController