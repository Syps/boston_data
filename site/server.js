var express      = require('express');
var app          = express();
var favicon      = require('serve-favicon');

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views')
app.use('/', express.static(__dirname + '/public/'))
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.set('port', (process.env.PORT || 3000))


app.get('/neighborhoods.json', (req,res) => {
	neighborhoods = require('./public/json/neighborhoods.json');
	res.send(neighborhoods);
});

app.get('/boston-data', (req,res) => {
	res.render('index.html');
});

app.listen(8080); 
console.log('boo-yah 8080!');
