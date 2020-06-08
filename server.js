var express = require('express');
var app = express();
var request = require("request")
const bodyParser = require('body-parser');


app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var PORT = 4006;
app.listen(PORT);
console.log('Listening at http://localhost:'+PORT);

function createOptionsObj(instances_list)
{
	var options = {
	  uri: 'http://35.224.13.15/',
	  method: 'POST',
	  json: {
		"instances": instances
	  }
	};
}
app.get("/test", function(req, res)
{
	console.log("query: "+Object.keys(req.query));
});

app.post('/queryStoryModel', function (req, res) {
    
	console.log("query: "+Object.keys(req.query));
	console.log("body: "+JSON.stringify(req.body)); 

	var param_name = "event_list";
	//console.log("body: "+JSON.stringify()); 

	var event_list = (req.body[param_name] || '[]')
	var event_list = JSON.parse(event_list);

	if(event_list.length==0)
	{
		var message = "Error, please enter at least 1 event description.";
		res.send(message);
		return
	}
	
	for(var i = 0;i<event_list.length;i++)
	{
		var textFromUser = event_list[i].trim().toLowerCase().replace(",", "");
		if(textFromUser.length==0)
		{
			var message = "Error, all event descriptions must contain some text.";
			res.send(message);
			return;
		}
		event_list[i] = textFromUser;
	}
	
	var dummyValue = ".";
	var prefix = "_: ";
	var instances =  new Array(event_list.length+1); 
	instances[0] = prefix+dummyValue+" "+prefix+event_list[0];
	for(var i = 1;i<event_list.length;i++)
	{
		instances[i] = prefix+event_list[i-1]+" "+prefix+event_list[i];	
	}
	instances[instances.length-1] = prefix+event_list[event_list.length-1]+" "+prefix+dummyValue;
	
	console.log("instances: "+JSON.stringify(instances)); 

	res.redirect('/');
	//"_: Andy was invited to a Halloween party. _: Andy was disappointed with his new, bold, green hair color."
});
