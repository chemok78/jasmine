/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai');

const restaurants = require('./restaurants');

// This function is the core of the bot behaviour
const replyMessage = (message) => {
  // Instantiate Recast.AI SDK, just for request service
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE);
  // Get text from message received
  const text = message.content;

  console.log('I receive: ', text);

  // Get senderId to catch unique conversation_token
  const senderId = message.senderId;

  // Call Recast.AI SDK, through /converse route
  request.converseText(text, { conversationToken: senderId })
  //Recast AI analyses the text and returns result object
  .then(result => {
    
    /*
    * YOUR OWN CODE
    * Here, you can add your own process.
    * Ex: You can call any external API
    * Or: Update your mongo DB
    * etc...
    */
    
    //Recast takes text analyses that, returns a result object, generates replies adds messages to reply stack and then sends the replies
    
    //Call Yelp API with when the intent is Location. When Yelp returns result we add it to the result.replies array. 
    //Then we add everything in result.replies to the messaging queue that sends the responses to FB
    
    
    if (result.action) {
      
      console.log('The conversation action is: ', result.action.slug);
      
    }

    // If there is not any message return by Recast.AI for this current conversation
    if (!result.replies.length) {
      message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' });
    } else {
      // Add each reply received from API to replies stack
      result.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }));
    }

    // Send all replies
    return message.reply()
    //send initial reply generated by Recast first
    .then(() => {
    //call restaurant function that returns a list of results from API  
    //if the action is location and done
      if(result.action && result.action.slug === 'location' && result.action.done){
        
        return restaurants(result.getMemory('location').raw)
          .then(res=>{
            
            console.log(res);
        
            message.addReply(res);
            return message.reply();
         
          });
    
      }
      
    })
    .catch(err => {
      console.error('Error while sending message to channel', err);
    });
  })
  .catch(err => {
    console.error('Error while sending message to Recast.AI', err);
  });
};

module.exports = replyMessage;
