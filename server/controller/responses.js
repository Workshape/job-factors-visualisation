var fs = require('fs');

var RESPONSES_PATH = './data/responses.json';

module.exports = function (req, res, next) {
    fs.exists(RESPONSES_PATH, function (exists) {
        if (exists) {
            fs.readFile(RESPONSES_PATH, 'utf8', function (err, content) {
                if (err) { return next(err); }

                res.status(200).send({ responses: processData(JSON.parse(content)) });
            });
        } else {
            res.status(404).send('Data not available');
        }
    });
};

function processData(data) {
    return data.responses.map(function (response) {
        return Object.keys(response.answers).map(function (key) {
            return parseValue(response.answers[key]);
        });
    });
}

function parseValue(val) {
    if (parseInt(val, 10) + '' === val + '') {
        return parseInt(val, 10);
    }

    return val;
}