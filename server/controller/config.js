var config = require('config');

module.exports = function (req, res) {
    var typeform = config.get('typeform'),
        baseUrl = config.get('baseUrl');

    return res.status(200).send({
        config : {
            typeform_id : typeform.id,
            base_url    : baseUrl
        }
    });
};