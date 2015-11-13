import Vue from 'vue';
import Color from 'color';
import template from '../../views/component/countries-breakdown.jade';
import store from '../core/store';
import arrayUtil from '../util/array';
import countryCodes from '../geo/country-codes.json';

const RELEVANT_SAMPLE = 50,
    COLOR_START = '#e77249',
    COLOR_END = '#297771';

Vue.component('countries-breakdown', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            chart   : [],
            reverse : false
        };
    },
    props    : [ 'key' ],
    template,
    created,
    methods  : { update, sort }
});

function created() {
    this.$watch('key', this.update);
    this.$watch('reverse', this.sort);
    this.update();
}

function update() {
    var samples = store.getData().samples,
        countries = {},
        chart = [],
        sample, countryName, country, score;

    for (sample of samples) {
        if (!countries[sample.location]) {
            countries[sample.location] = [];
        }

        countries[sample.location].push(sample['rate_' + this.key]);
    }

    for (countryName in countries) {
        if (countries.hasOwnProperty(countryName)) {
            country = countries[countryName];
            score = arrayUtil.getSum(country) / country.length;

            if (country.length >= RELEVANT_SAMPLE) {
                chart.push({
                    code  : countryCodes[countryName],
                    name  : countryName,
                    score : score,
                    color : new Color(COLOR_START).mix(new Color(COLOR_END), score / 10).hexString()
                });
            }
        }
    }

    this.chart = chart;

    this.sort();
}

function sort() {
    this.chart = this.chart.sort((a, b) => {
        if (this.reverse) {
            return a.score > b.score ? 1 : -1;
        } else {
            return a.score > b.score ? -1 : 1;
        }
    });

    this.chart.forEach((country, i) => {
        i+= 1;
        country.position = this.reverse ? this.chart.length - i : i;
    });
}