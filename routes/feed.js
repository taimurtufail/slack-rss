var express = require('express');
var router = express.Router();
var rss = require('rss');
var Slack = require('slack-node');

router.get('/:channel_name', function(req, res, next) {
 	apiToken = process.env.SLACK_API_KEY;
  	slack = new Slack(apiToken);

  	slack.api('channels.list', function(err, response) {
  		for(var c=0; c< response.channels.length; c++) {
  			var channel = response.channels[c];

  			if(channel.name == req.params.channel_name) {
  				var feed = new rss({
  					title:"#" + channel.name,
  					description:"The links that have been posted to the #"+channel.name +" on Slack",
  					site_url: 'https://www.linnworks.com',
  					ttl: '30',
  				});

  				slack.api('channels.history', {'channel':channel.id,'count':process.env.HISTORY_LENGTH} ,function(err, response){
			  		for(var i = 0; i < response.messages.length; i++) {
			  			if(response.messages[i].text) {  				
				  			for(var j = 0; j < response.messages[i].text.length;) {
				  				if(response.messages[i].text) {
				  					var link = response.messages[i].text;

				  					var t = new Date(response.messages[i].ts * 1000);

				  					feed.item({
                      title: "Important Updates"
				  						description: link,
				  						date: t
				  					});
				  				}
				  			}
			  			}
  					}

  				res.send(feed.xml({indent: true}));
				});
  			}
  		}
  	});
});

module.exports = router;
