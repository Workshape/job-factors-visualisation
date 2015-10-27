var Vue = require('vue');

Vue.filter('floor', function (num, decimals = 0) {
    if (typeof num === 'undefined' || num === null) { return '-'; }

    num = num.toString();
    decimals = parseInt(decimals, 10);

    if (num.indexOf('.') === -1) {
        return num;
    }

    return num.slice(0, (num.indexOf('.')) + (decimals + 1));
});