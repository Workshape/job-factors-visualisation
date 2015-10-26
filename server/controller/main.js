var path = require('path');

module.exports = function (req, res) {
     res.sendFile(path.resolve('./www/index.html'));
};