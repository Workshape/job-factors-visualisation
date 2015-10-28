import d3 from 'd3';
import topojson from 'topojson';
import keycode from 'keycode';
import Color from 'color';
import Vue from 'vue';
import template from '../../views/component/relevance-map.jade';
import store from '../core/store';
import countries from '../geo/countries';

const COLOR_START = '#e77249',
    COLOR_END = '#297771',
    COLOR_NO_DATA = '#666',
    RELEVANT_SAMPLE = 50,
    MAP_SIZE = [ 1000, 680 ],
    MAP_SCALE = 160,
    MAP_OFFSET = [ 500, 480 ],
    SHOW_KEYS = [
        { id: 'salary', label: 'Salary' },
        { id: 'stack', label: 'Tech' },
        { id: 'title', label: 'Job Title' },
        { id: 'team', label: 'Team' },
        { id: 'industry', label: 'Industry' },
        { id: 'product', label: 'Product' },
        { id: 'options', label: 'Options' },
        { id: 'location', label: 'Location' },
        { id: 'commute', label: 'Commute' },
        { id: 'size', label: 'Org. Size' },
        { id: 'benefits', label: 'Benefits' }
    ];

Vue.component('relevance-map', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            keys        : SHOW_KEYS,
            hovered     : null,
            active      : null,
            info        : null,
            comparative : true
        };
    },
    props    : [ 'key', 'ready' ],
    template,
    ready,
    beforeDestroy,
    methods  : { buildData, render, getColor }
});

function ready() {
    this.samples = store.getData().samples;
    this.data = this.buildData();
    this.info = this.data.info;
    this.meta = this.data.meta;

    this.onkeydown = keydown.bind(this);

    window.addEventListener('keydown', this.onkeydown);

    this.$watch('key', this.render);
    this.$watch('comparative', this.render);
    this.render();
}

function beforeDestroy() {
    window.removeEventListener('keydown', this.onkeydown);
}

function keydown(e) {
    var key = keycode(e.keyCode);

    if (key === 'esc') {
        this.active = null;
    }
}

function buildData() {
    var countries = {},
        out = { countries: {} },
        meta = {},
        sample, key, country, c, average, keyId;

    for (sample of this.samples) {
        country = countries[sample.location];

        if (!country) {
            countries[sample.location] = { values: {}, count: 0 };
            country = countries[sample.location];
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
        meta[c] = { highest: null, lowest: null };

        for (key in country.values) {
            if (country.values.hasOwnProperty(key)) {
                average = country.values[key].total / country.count;
                keyId = key.substr(5);

                out.countries[c][keyId] = {
                    total      : country.values[key].total,
                    count      : country.count,
                    average    : average,
                };

                if (!meta[c].lowest || average < out.countries[c][meta[c].lowest].average) {
                    meta[c].lowest = keyId;
                }

                if (!meta[c].highest || average > out.countries[c][meta[c].highest].average) {
                    meta[c].highest = keyId;
                }
            }
        }
    }

    out.meta = meta;
    out.ranges = getAverageRanges(out.countries);
    out.info = getKeysInfo(out);

    return out;
}

function getKeysInfo(data) {
    var info = {},
        range, key, c, country;

    for (key of SHOW_KEYS) {
        info[key.id] = { lowest: [], highest: [] };
        range = data.ranges[key.id];

        for (c in data.countries) {
            if (data.countries.hasOwnProperty(c)) {
                country = data.countries[c];

                if (country[key.id].average === range.min) {
                    info[key.id].lowest.push(c);
                }

                if (country[key.id].average === range.max) {
                    info[key.id].highest.push(c);
                }
            }
        }

        info[key.id].lowest = info[key.id].lowest.join(', ');
        info[key.id].highest = info[key.id].highest.join(', ');
    }

    return info;
}

function getAverageRanges(countries) {
    var ranges = {},
        c, country, key;

    for (c in countries) {
        if (countries.hasOwnProperty(c)) {
            country = countries[c];

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

    return ranges;
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

    this.paths
    .attr('fill', (country) => {
        return this.getColor(country.properties.name);
    })
    .attr('stroke', (country) => {
        return new Color(this.getColor(country.properties.name)).darken(0.5).rgbaString();
    })
    .classed('has-data', (country) => {
        var data = this.data.countries[country.properties.name] || {};

        return data[this.key] && data[this.key].count >= RELEVANT_SAMPLE;
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
    })
    .on('click', (country) => {
        var countryData = this.data.countries[country.properties.name] || {};

        this.paths.classed('active', function (c) {
            return c === country;
        });

        this.active = {
            name : country.properties.name,
            data : countryData || null
        };
    });
}

function getColor(countryName, key = null) {
    if (key === null) { key = this.key; }

    var data = this.data.countries[countryName],
        range = this.data.ranges[key],
        value;

    if (!data || data[key].count < RELEVANT_SAMPLE) {
        return COLOR_NO_DATA;
    }

    if (this.comparative) {
        value = (data[key].average - range.min) / (range.max - range.min);
    } else {
        value = data[key].average / 10;
        console.log(data[key].average);
    }

    return new Color(COLOR_START).mix(new Color(COLOR_END), value).hexString();
}