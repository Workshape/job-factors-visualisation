import api from './core/api';
import error from './core/error';
import resolve from './data/resolve';
import Vue from 'vue';
import store from './core/store';

// Vue.config.debug = true;

require('./filter/number');

require('./component/relevance-map');
require('./component/interest-bar-chart');
require('./component/bar-chart');
require('./component/line-chart');
require('./component/seniority-charts');

require('./directive/follow-mouse');

function init() {
    new Vue({
        el   : document.body,
        data : () => {
            return {
                samples : null,
                ready   : false
            };
        },
        created,
        methods: { loaded }
    });
}

function created() {
    api.responses.get()
    .then((res) => {
        this.loaded(res.body.data);
    }, function () {
        error.handle(new Error('Failed loading data'));
    })
    .catch(error.handle);
}

function loaded(data) {
    var samples = resolve(data);

    store.setData({
        data    : data,
        samples : samples
    });

    this.ready = true;
}

init();