import Vue from 'vue';

Vue.filter('limit', function (array, limit) {
    return array.slice(0, limit);
});

Vue.filter('offset', function (array, offset) {
    return array.slice(offset);
});