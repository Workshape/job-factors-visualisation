import Vue from 'vue';
import template from '../../views/component/line-chart.jade';
import svgUtil from '../util/svg';

const CHART_SIZE = [ 800, 200 ],
    V_SCALE_WIDTH = 20,
    X_SCALE_HEIGHT = 20,
    LABEL_MARGIN = 10,
    AXIS_OFFSET = 5,
    DOT_SIZE = 4,
    PADDING = 10,
    HOVER_RADIUS = 40;

Vue.component('line-chart', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            highlight : null
        };
    },
    props    : [ 'labels', 'values', 'classes' ],
    template,
    ready,
    methods  : { update, render, renderGrid, getRange, renderLine, getPoints, renderLabels, renderBackground }
});

function ready() {
    this.$watch('values', this.update);
    this.$watch('labels', this.update);
    this.update();
}

function update() {
    if (this.values instanceof Array) {
        this.values = { values: this.values };
    }

    this.range = this.getRange();
    this.render();
}

function getRange() {
    var min = Infinity,
        length = 0,
        max = 0,
        value, key;

    for (key in this.values) {
        length = Math.max(length, this.values[key].length);

        if (this.values.hasOwnProperty(key)) {
            for (value of this.values[key]) {
                min = Math.min(value, min);
                max = Math.max(value, max);
            }
        }
    }

    return { min: Math.ceil(min) - 1, max: Math.ceil(max), length };
}

function render() {
    var key;

    if (this.svg) {
        this.$el.removeChild(this.svg.el);
    }

    this.svg = svgUtil.svg(CHART_SIZE);
    this.$el.appendChild(this.svg.el); 
    this.renderBackground();
    this.renderGrid();
    this.renderLabels();

    for (key in this.values) {
        if (this.values.hasOwnProperty(key)) {
            this.renderLine(this.values[key], key);
        }
    }
}

function renderGrid() {
    var group = this.svg.add('group', { class: 'chart-grid' });

    renderGridVertical.call(this, group);
    renderGridHorizontal.call(this, group);
}

function renderBackground() {
    var from = getInnerChartPoint([ 0, 0 ]),
        to = getInnerChartPoint([ 100, 100 ]),
        width = to[0] - from[0],
        height = to[1] - from[1];

    this.svg.add('rectangle', from, width, height, { class: 'chart-background' });
}

function renderLine(values, key) {
    var group = this.svg.add('group', { class: 'chart-group-' + key }),
        points = this.getPoints(values);

    renderArea.call(this, points, group);
    renderSegments.call(this, points, group);
    renderPoints.call(this, points, group, key);
}

function getPoints(values) {
    var out = [],
        i, val;

    for (i = 0; i < values.length; i++) {
        val = values[i];

        out.push([
            (i * 100) / (this.range.length - 1),
            ((val - this.range.min) * 100) / (this.range.max - this.range.min)
        ]);
    }

    return out;
}

function renderArea(values, group) {
    var origin = getInnerChartPoint([ 0, 100 ]),
        end = getInnerChartPoint([ 100, 100 ]),
        d = `M ${origin[0]} ${origin[1]}`,
        cname = 'chart-area',
        point, i;

    for (i = 0; i < values.length; i++) {
        point = getInnerChartPoint(values[i]);

        d += `L ${point[0]} ${point[1]} `;
    }

    d += `L ${end[0]} ${end[1]}`;

    group.add('path', d, { class  : cname });
}

function renderSegments(values, group) {
    values.forEach(function (from, i) {
        var to = values[i + 1],
            cname = 'chart-line';

        if (!to) { return; }

        group.add(
            'line',
            getInnerChartPoint(from),
            getInnerChartPoint(to), { class  : cname });

        group.add(
            'line',
            getInnerChartPoint(from),
            getInnerChartPoint(to),
            {
                class : 'chart-line-hover'
            });
    });
}

function renderPoints(points, group, key) {
    points.forEach((point, i) => {
        group.add('circle', getInnerChartPoint(point), DOT_SIZE, {
            class : 'chart-point'
        });

        var hoverArea = group.add('circle', getInnerChartPoint(point), HOVER_RADIUS, {
            class : 'chart-point-hover'
        });

        bindPointInteraction.call(this, hoverArea, this.values[key][i]);
    });
}

function bindPointInteraction(group, point) {
    // Highlight on mouse enter
    group.el.addEventListener('mouseenter', () => {
        this.highlight = point;
    });

    // Remove highlight on mouse leave
    group.el.addEventListener('mouseleave', () => {
        this.highlight = null;
    });
}

/*
 * Render chart grid's horizontal axis
 *
 * @param {SVGElement} parent
 */
function renderGridHorizontal(parent) {
    var count = this.range.max - this.range.min,
        from, to, y, percent, cname;

    for (y = 0; y < count + 1; y++) {
        cname = 'chart-grid-axis';

        if (y === 0) {
            cname += ' chart-grid-axis-key';
        }

        percent = 100 - (y * 100) / (count);

        from = getInnerChartPoint([ 0, percent ]);
        to = getInnerChartPoint([ 100, percent ]);

        from[0] -= AXIS_OFFSET;

        parent.add('line', from, to, { class: cname });
    }
}

/*
 * Render chart grid's vertical axis
 *
 * @param {SVGElement} parent
 */
function renderGridVertical(parent) {
    var from, to, x, percent, cname;

    // Draw vertical axis
    for (x = 0; x < this.range.length; x++) {
        cname = 'chart-grid-axis';

        if (x === this.range.length - 1) {
            cname += ' chart-grid-axis-key';
        }

        percent = 100 - (x * 100) / (this.range.length - 1);

        from = getInnerChartPoint([ percent, 0 ]);
        to = getInnerChartPoint([ percent, 100 ]);

        to[1] += AXIS_OFFSET;

        parent.add('line', from, to, { class: cname });
    }
}

function getInnerChartPoint(percentPoint) {
    return [
        V_SCALE_WIDTH + PADDING + ((CHART_SIZE[0] - PADDING * 2 - V_SCALE_WIDTH) * percentPoint[0]) / 100,
        PADDING + ((CHART_SIZE[1] - PADDING * 2 - X_SCALE_HEIGHT) * percentPoint[1]) / 100
    ];
}

/*
 * Render chart labels on both axis
 */
function renderLabels() {
    renderLabelsHorizontal.call(this);
    renderLabelsVertical.call(this);
}

/*
 * Render chart labels on horizontal axes
 */
function renderLabelsHorizontal() {
    var i, origin, label, cname;

    for (i = 0; i < this.labels.length; i++) {
        origin = getInnerChartPoint([
            (i * 100) / (this.labels.length - 1),
            100
            ]);

        cname = 'chart-label chart-label-x';

        if (i === 0) {
            cname += ' first';
        }

        if (i === this.labels.length - 1) {
            cname += ' last';
        }

        origin[1] += LABEL_MARGIN;

        label = this.labels[i];

        this.svg.add('text', origin, label, { class: cname });
    }
}

/*
 * Render chart labels on vertical axes
 */
function renderLabelsVertical() {
    var i, origin;

    // Y Labels
    for (i = 0; i < this.range.max - this.range.min + 1; i++) {
        origin = getInnerChartPoint([
            0,
            100 - (i * 100) / (this.range.max - this.range.min)
            ]);

        origin[0] -= LABEL_MARGIN;

        this.svg.add('text', origin, String(i + this.range.min), { class: 'chart-label chart-label-y' });
    }
}