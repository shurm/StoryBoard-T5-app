var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var rp = require('request-promise');
const fetch = require("node-fetch");

const modelURL = "http://35.224.13.15/v1/models/half_plus_two:predict";
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// set the view engine to ejs
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log('Listening at http://localhost:'+PORT);

function createFetchObj(instance)
{
	return fetch(modelURL,
					{	method: "POST", 
						body: JSON.stringify({"instances": [instance]}),
						headers: {"Content-Type": "application/json"}
					}).then(function(res){ return res.json(); })
}
app.get("/", function(req, res)
{
	res.render('index');
});

app.post('/queryStoryModel', function (req, res) {
    
	
	console.log("body: "+JSON.stringify(req.body)); 

	var param_name = "event_list";
	//console.log("body: "+JSON.stringify()); 

	var original_text = (req.body[param_name] || '[]')
	original_text = JSON.parse(original_text);
	var event_list = original_text.slice();
	if(event_list.length==0)
	{
		var message = "Error, please enter at least 1 event description.";
		res.render('index',{ error_message : message, provided_texts : original_text});

		return;
	}
	
	for(var i = 0;i<event_list.length;i++)
	{
		var textFromUser = event_list[i].trim().toLowerCase().replace(",", "");
		if(textFromUser.length==0)
		{
			var message = "Error, all event descriptions must contain some text.";
			res.render('index',{ error_message : message, provided_texts : original_text});

			return;
		}
		event_list[i] = textFromUser;
	}
	console.log("original_text is "+original_text.toString());
	
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
	var fetches = [];
	
	for(var i =0;i<instances.length;i++)
	{
		fetches.push(createFetchObj(instances[i]));
	}
	console.log("fetches.length: "+fetches.length); 
	Promise.all(fetches).then(data => {
		var generated_texts = [];
		for(var i =0;i<data.length;i++)
		{
			var generated_text = data[i]["predictions"][0]["outputs"];
			generated_texts.push(generated_text);
		}
		 
		console.log(generated_texts);
		console.log("generated_texts.length "+generated_texts.length);

		 console.log("promise.all done");
		 //res.send("done");
		
		 res.render('index',{ generated_texts : generated_texts, provided_texts : original_text });

		 
		}).catch(function(err) {
				// dispatch a failure and throw error
			console.log("error!!!!!");
			res.render('index',{ error_message : "There was an error processing your request. Please try again.", provided_texts : original_text });

		});
	//var options = createOptionsObj(instances[0]);
	//console.log("options: "+JSON.stringify(options)); 



});
