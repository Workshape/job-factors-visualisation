var express = require('express'),
    config = require('config'),
    color = require('cli-color'),
    compression = require('compression');

var app = express(),
    server = app.listen(process.env.PORT || 2000, listen),
    typeform = config.get('typeform');

app.get('/', require('./controller/main'));
app.get('/api/responses', require('./controller/responses'));
app.use('/static', express.static('./www'));
app.use(compression());

function listen() {
    console.log('Listening on ' + color.cyan('http://localhost:' + server.address().port));
}

if (!typeform.key || !typeform.id) {
    console.log(color.red('Typeform configuration missing'));
    process.exit();
}