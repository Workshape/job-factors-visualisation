var fs = require('fs');

var RESPONSES_PATH = './data/responses.json';

module.exports = function (req, res, next) {
    fs.exists(RESPONSES_PATH, function (exists) {
        if (exists) {
            fs.readFile(RESPONSES_PATH, 'utf8', function (err, content) {
                if (err) { return next(err); }

                res.status(200).send({ data: JSON.parse(content) });
            });
        } else {
            res.status(404).send('Data not available');
        }
    });
};