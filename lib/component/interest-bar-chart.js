import Vue from 'vue';
import _ from 'lodash';
import template from '../../views/component/interest-bar-chart.jade';
import store from '../core/store';
import constants from '../core/constants';

Vue.component('interest-bar-chart', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            bars : null
        };
    },
    props    : [ 'horizontal', 'filter' ],
    template,
    ready,
    methods  : { getSamples, getData, getBars }
});

function ready() {
    this.bars = this.getBars();
}

function getBars() {
    var data = this.getData(),
        bars = [],
        key, point;

    for (key in data.values) {
        if (data.values.hasOwnProperty(key)) {
            point = data.values[key];

            bars.push({
                label   : point.label,
                percent : (point.average * 100) / data.max + '%'
            });
        }
    }

    return bars;
}

function getData() {
    var samples = this.getSamples(),
        values = {},
        max, sample, key, k;

    for (sample of samples) {
        for (key of constants.SHOW_KEYS) {
            k = key.id;

            if (!values[k]) {
                values[k] = { total: 0, count: 0, label: key.label };
            }

            values[k].total += sample['rate_' + k];
            values[k].count++;
        }
    }

    for (key in values) {
        if (values.hasOwnProperty(key)) {
            values[key].average = parseInt(values[key].total, 10) / parseInt(values[key].count, 10);

            if (!max || values[key].average > max) {
                max = values[key].average;
            }
        }
    }

    return { values, max };
}

function getSamples() {
    var data = store.getData();

    if (!this.filter) {
        return data.samples;
    }

    return _.filter(data.samples, this.filter);
}