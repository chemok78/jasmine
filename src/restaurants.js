const rp = require('request-promise');

// Load configuration
require('./config');

const getRestaurants = (location) => {
  
  const auth = {
    method: 'POST',
    url: 'https://api.yelp.com/oauth2/token?grant_type=client_credentials&client_id='+ process.env.YELP_APP_ID +'&client_secret='+process.env.APP_SECRET
  };

  return rp(auth)
  //authorize first and return tokens
    .then(result => {
    const tokens = JSON.parse(result);
    return tokens;
  })
  .then(tokens=>{
  //use tokens to call Yelp API and return results
    const options = {
      url: 'https://api.yelp.com/v3/businesses/search?location=' + location + "&term=thai",
      headers: {Authorization: "Bearer " + tokens.access_token}  
    };
    
    return rp(options);
    })
    //Parse Yelp results and send it back to message.js
    .then(list =>{
    
      const findings = JSON.parse(list);
      
      let results = [];
    
      for(var i = 0; i < 5; i ++){
    
      //get the first 5 results  
      results.push(findings.businesses[i].name);
      
      }
    
      console.log(results);
    
      results = JSON.stringify(results);
    
      return {type: 'text', content: results};
    
    });
  
};//getRestaurants

//export the getRestaurants function that can be called with a location parameter
module.exports = location => getRestaurants(location);