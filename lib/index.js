require('babel-polyfill');

import api from './core/api';
import error from './core/error';
import resolve from './data/resolve';
import Vue from 'vue';
import store from './core/store';
import constants from './core/constants';

Vue.config.debug = true;

require('./filter/number');

require('./component/relevance-map');
require('./component/interest-bar-chart');
require('./component/bar-chart');
require('./component/line-chart');
require('./component/seniority-charts');
require('./component/pie-chart');

require('./directive/follow-mouse');

function init() {
    new Vue({
        el   : document.body,
        data : () => {
            return {
                ready              : false,
                genderDistribution : null,
                keyClasses         : getKeyClasses(),
                totalResponses     : null
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

    this.totalResponses = samples.length;
    this.genderDistribution = getGenderDistribution();
    this.ready = true;
}

function getGenderDistribution() {
    var samples = store.getData().samples,
        counts = {},
        sample;

    for (sample of samples) {
        if (!counts[sample.gender]) { counts[sample.gender] = 0; }

        counts[sample.gender]++;
    }

    return [ counts.Male, counts.Other, counts.Female ];
}

function getKeyClasses() {
    return constants.SHOW_KEYS.map(function (key) {
        return key.id;
    });
}

init();