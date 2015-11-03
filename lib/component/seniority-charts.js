import Vue from 'vue';
import template from '../../views/component/seniority-charts.jade';
import store from '../core/store';
import constants from '../core/constants';
import arrayUtil from '../util/array';

Vue.component('seniority-charts', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            keys    : constants.SHOW_KEYS,
            lines   : null,
            labels  : getLabels(),
            changes : null
        };
    },
    props    : [],
    template,
    created,
    methods: { update, getDir, getDiff, getChanges }
});

function created() {
    this.$watch('values', this.update);
    this.update();
}

function update() {
    var samples = store.getData().samples,
        values = {},
        lines = {},
        overall = [],
        sample, index, key, bucket;

    for (sample of samples) {
        index = constants.SENIORITY_LEVELS.indexOf(sample.experience);

        for (key of constants.SHOW_KEYS) {
            if (!values[key.id]) { values[key.id] = []; }

            if (!values[key.id][index]) { values[key.id][index] = []; }
            values[key.id][index].push(sample[key.prop]);
        }
    }

    for (key of constants.SHOW_KEYS) {
        lines[key.id] = [];

        for (index = 0; index < values[key.id].length; index++) {
            lines[key.id][index] = arrayUtil.getAverage(values[key.id][index]);
        }
    }

    for (index = 0; index < constants.SENIORITY_LEVELS.length; index++) {
        bucket = [];

        for (key of constants.SHOW_KEYS) {
            bucket.push(lines[key.id][index]);
        }

        overall.push(arrayUtil.getAverage(bucket));
    }

    this.overall = overall;
    this.lines = lines;
    this.changes = this.getChanges();
}

function getLabels() {
    return constants.SENIORITY_LEVELS;
}

function getDir(key) {
    var values = this.lines[key],
        start = values[0],
        end = values[values.length - 1];

    return start > end ? 1 : -1;
}

function getDiff(key) {
    var values = this.lines[key],
        start = values[0],
        end = values[values.length - 1];

    return Math.abs(start - end);
}

function getChanges() {
    var gains = [],
        losses = [],
        key, dir, diff, dest;

    for (key of constants.SHOW_KEYS) {
        dir = this.getDir(key.id);
        diff = this.getDiff(key.id);
        dest = dir === 1 ? gains : losses;
        dest.push({ key, dir, diff });
    }

    return { gains, losses };
}