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
            sets   : null,
            labels : getLabels()
        };
    },
    props    : [ 'horizontal', 'filters', 'classes' ],
    template,
    ready,
    methods  : { getSets }
});

function ready() {
    this.sets = this.getSets();
}

function getSets() {
    var sets = [],
        samples = store.getData().samples,
        set, values, filter, sample, key, k;

    for (filter of this.filters) {
        values = {};
        set = [];

        for (sample of _.filter(samples, filter)) {

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
                set.push(values[key].total / values[key].count);
            }
        }

        sets.push(set);
    }

    return sets;
}

function getLabels() {
    return constants.SHOW_KEYS.map(function (key) {
        return key.label;
    });
}