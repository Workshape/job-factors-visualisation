require('babel-polyfill');

import api from './core/api';
import error from './core/error';
import resolve from './data/resolve';
import Vue from 'vue';
import store from './core/store';
import constants from './core/constants';
import parallax from './ui/parallax';
import uiUtil from './util/ui';

Vue.config.debug = true;

require('./filter/number');
require('./filter/array');

require('./component/relevance-map');
require('./component/interest-bar-chart');
require('./component/bar-chart');
require('./component/line-chart');
require('./component/seniority-charts');
require('./component/pie-chart');
require('./component/countries-breakdown');

require('./directive/follow-mouse');

function init() {
    new Vue({
        el      : document.body,
        data    : () => {
            return {
                ready              : false,
                genderDistribution : null,
                keyClasses         : getKeyClasses(),
                totalResponses     : null,
                keys               : constants.SHOW_KEYS,
                config             : {}
            };
        },
        created,
        methods : {
            loaded,
            loadData,
            loadConfig,
            tweet,
            fbshare
        }
    });
}

function created() {
    this.loadConfig();
    this.loadData();
}

function loadData() {
    api.responses.get()
    .then((res) => {
        this.loaded(res.body.responses);
    }, function () {
        error.handle(new Error('Failed loading data'));
    })
    .catch(error.handle);
}

function loadConfig() {
    api.config.get()
    .then((res) => {
        this.config = res.body.config;
    }, function () {
        error.handle(new Error('Failed loading configuration'));
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

    // Next tick..
    setTimeout(() => {
        parallax.init();
    });
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

function tweet() {
    var text = 'The most important job factors for #devs - a living #infographic by Workshape.io',
        url = this.config.base_url,
        dialogUrl = [
            'http://twitter.com/share?url=',
            encodeURIComponent(url) + '&text=',
            encodeURIComponent(text) + '&count=none/'
        ].join('');

    uiUtil.showPopup(dialogUrl, 'Tweet');
}

function fbshare() {
    var url = this.config.base_url,
        dialogUrl = [
            'http://www.facebook.com/sharer.php?u=',
            encodeURIComponent(url)
        ].join('');

    uiUtil.showPopup(dialogUrl, 'Share on Facebook');
}

init();