var Vue = require('vue');

Vue.filter('floor', function (str) {
    return Math.floor(parseInt(str, 10));
});