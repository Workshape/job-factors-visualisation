import d3 from 'd3';
import topojson from 'topojson';
import Color from 'color';
import Vue from 'vue';
import template from '../../views/component/relevance-map.jade';
import store from '../core/store';
import countries from '../geo/countries';

const COLOR_START = '#e77249',
    COLOR_END = '#405765',
    RELEVANT_SAMPLE = 50,
    MAP_SIZE = [ 1000, 680 ],
    MAP_SCALE = 160,
    MAP_OFFSET = [ 500, 480 ],
    SHOW_KEYS = [
        { id: 'salary', label: 'Salary' },
        { id: 'stack', label: 'Tech' },
        { id: 'title', label: 'Title' },
        { id: 'team', label: 'Team' },
        { id: 'industry', label: 'Industry' },
        { id: 'product', label: 'Product' },
        { id: 'options', label: 'Options' },
        { id: 'location', label: 'Location' },
        { id: 'commute', label: 'Commute' },
        { id: 'size', label: 'Company Size' },
        { id: 'benefits', label: 'Benefits' }
    ];

Vue.component('relevance-map', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            keys    : SHOW_KEYS,
            hovered : null
        };
    },
    props    : [ 'key', 'ready' ],
    template,
    ready,
    methods  : { buildData, render }

});

function ready() {
    this.samples = store.getData().samples;
    this.data = this.buildData();

    this.$watch('key', this.render);
    this.render();
}

function buildData() {
    var countries = {},
        out = { countries: {} },
        ranges = {},
        sample, key, country, c, range;

    for (sample of this.samples) {
        country = countries[sample.location];

        if (!country) {
            countries[sample.location] = { values: {}, count: 0 };
            country = countries[sample.location];
        }

        if (sample.location === 'Italy') {
        }

        country.count += 1;

        for (key in sample) {
            if (sample.hasOwnProperty(key) && key.indexOf('rate_') !== -1) {
                if (!country.values[key]) {
                    country.values[key] = { total : 0 };
                }

                country.values[key].total += sample[key];
            }
        }
    }

    for (c in countries) {
        out.countries[c] = {};
        country = countries[c];

        for (key in country.values) {
            if (country.values.hasOwnProperty(key)) {
                range = ranges[key];

                out.countries[c][key.substr(5)] = {
                    total      : country.values[key].total,
                    count      : country.count,
                    average    : country.values[key].total / country.count,
                };
            }
        }
    }

    for (c in out.countries) {
        if (out.countries.hasOwnProperty(c)) {
            country = out.countries[c];

            for (key in country) {
                if (country.hasOwnProperty(key)) {

                    if (!ranges[key]) {
                        ranges[key] = { min: Infinity, max: 0 };
                    }

                    if (country[key].count >= RELEVANT_SAMPLE) {
                        ranges[key].min = Math.min(ranges[key].min, country[key].average);
                        ranges[key].max = Math.max(ranges[key].max, country[key].average);
                    }
                }
            }
        }
    }

    out.ranges = ranges;

    return out;
}

function render() {
    if (!this.svg) {
        this.projection = d3.geo.mercator()
        .translate([ MAP_OFFSET[0], MAP_OFFSET[1] ])
        .scale(MAP_SCALE);

        this.svg = d3.select(this.$el.querySelector('svg'))
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 ' + MAP_SIZE[0] + ' ' + MAP_SIZE[1]);

        this.path = d3.geo.path()
        .projection(this.projection);

        this.g = this.svg.append('g');

        this.paths = this.g.selectAll('path')
        .data(topojson.feature(countries, countries.objects.countries).features)
        .enter()
        .append('path')
        .attr('d', this.path);
    }

    this.paths.attr('fill', (country) => {
        var data = this.data.countries[country.properties.name],
            range = this.data.ranges[this.key],
            value;

        if (!data || data[this.key].count < RELEVANT_SAMPLE) {
            return 'rgba(0, 0, 0, .1)';
        }

        value = (data[this.key].average - range.min) / (range.max - range.min);

        return new Color(COLOR_START).mix(new Color(COLOR_END), value).hexString();
    })
    .on('click', (country) => {
        var data = this.data.countries[country.properties.name];

        console.log(country.properties.name, data);
    })
    .on('mouseenter', (country) => {
        var countryData = this.data.countries[country.properties.name] || {};

        this.hovered = {
            name : country.properties.name,
            data : countryData[this.key] || null
        };
    })
    .on('mouseleave', () => {
        this.hovered = null;
    });
}