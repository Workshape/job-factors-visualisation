import Vue from 'vue';
import template from '../../views/component/pie-chart.jade';
import svgUtil from '../util/svg';
import arrayUtil from '../util/array';

const CHART_SIZE = 500,
    DEFAULT_COLORS = [ '#e77249', '#405765', '#297771' ],
    PADDING = 5;

Vue.component('pie-chart', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            highlight : null
        };
    },
    props    : [ 'labels', 'values', 'classes', 'colors' ],
    template,
    ready,
    methods  : { update, render, drawSectors, getColor }
});

function ready() {
    this.$watch('values', this.update);
    this.$watch('labels', this.update);
    this.update();
}

function update() {
    var percentages = [],
        total = arrayUtil.getSum(this.values),
        value;

    for (value of this.values) {
        percentages.push((value * 100) / total);
    }

    this.percentages = percentages;
    this.render();
}

function render() {
    if (this.svg) {
        this.$el.removeChild(this.svg.el);
    }

    this.svg = svgUtil.svg([ CHART_SIZE, CHART_SIZE ]);
    this.$el.appendChild(this.svg.el); 

    this.drawSectors();
}

function drawSectors() {
    var angles = getAngles(this.percentages),
        startAngle = 0,
        endAngle = 0,
        radius = CHART_SIZE / 2 - PADDING,
        center = CHART_SIZE / 2,
        cname, i, d, arc, x1, x2, y1, y2, percent, value, label;

    for (i = 0; i < angles.length; i++) {
        startAngle = endAngle;
        endAngle = startAngle + angles[i];
        cname = this.classes ? this.classes[i] : null;
        percent = this.percentages[i];
        value = this.values[i];
        label = this.labels ? this.labels[i] : null;

        x1 = parseInt(Math.round(center + radius * Math.cos(Math.PI * startAngle / 180)));
        y1 = parseInt(Math.round(center + radius * Math.sin(Math.PI * startAngle / 180)));

        x2 = parseInt(Math.round(center + radius * Math.cos(Math.PI * endAngle / 180)));
        y2 = parseInt(Math.round(center + radius * Math.sin(Math.PI * endAngle / 180)));

        d = `M${center},${center} L${x1},${y1}A${radius},${radius} 0 ${(endAngle - startAngle > 180) ? 1 : 0},1 ${x2},${y2}z`;

        arc = this.svg.add('path', d, { fill: this.getColor(i), class: cname });

        bindSectorInteraction.call(this, arc, percent, value, label);
    }
}

function bindSectorInteraction(arc, percent, value, label) {
    // Highlight on mouse enter
    arc.el.addEventListener('mouseenter', () => {
        this.highlight = { percent, value, label };
    });

    // Remove highlight on mouse leave
    arc.el.addEventListener('mouseleave', () => {
        this.highlight = null;
    });
}

function getAngles(percentages) {
    return percentages.map(function (percent) {
        return 360 * percent / 100;
    });
}

function getColor(index) {
    var colors = this.colors ? this.colors : DEFAULT_COLORS;

    if (this.classes) { return null; }

    return colors[index % colors.length];
}