var config = require('config'),
    request = require('request'),
    color = require('cli-color');

var CACHE_LIFETIME = 1000 * 60 * 60,
    cache;

function ResponseError(message) {
    this.name = 'ResponseError';
    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
}

module.exports = function (req, res, next) {
    var typeformConfig = config.get('typeform'),
        key = typeformConfig.key,
        formId = typeformConfig.id,
        now = new Date().getTime(),
        requestUrl = 'https://api.typeform.com/v0/form/' + formId  + '?key=' + key + '&completed=true';

    if (cache && now - cache.time < CACHE_LIFETIME) {
        console.log(color.yellow('Serving from cache..'));
        return res.status(200).send({ data: cache.data });
    }

    console.log(color.yellow('Loading from TypeForm..'));

    request.get(requestUrl, function (err, response, body) {
        var data;

        if (err) { return next(err); }

        if (response.statusCode !== 200) {
            return next(new ResponseError('Error ' + response.statusCode));
        }

        try {
            data = JSON.parse(body);
        } catch (e) {
            return next(new ResponseError('Invalid response data'));
        }

        cache = {
            time : now,
            data : data
        };

        res.status(200).send({ data: data });
    });
};