import Vue from 'vue';
import template from '../../views/component/bar-chart.jade';

Vue.component('bar-chart', {
    isFn     : true,
    replace  : true,
    data     : () => {
        return {
            maxLength : 0,
            groups    : null
        };
    },
    props    : [ 'labels', 'values', 'horizontal' , 'classes' ],
    template,
    created,
    methods  : { update, getBarClass }
});

function created() {
    this.$watch('values', this.update);
    this.$watch('labels', this.update);
    this.update();
}

function update() {
    var groups = [],
        max = 0,
        maxLength = 0,
        set, val, i, n;

    this.sets = this.values[0] instanceof Array ? this.values : [ this.values ];

    for (set of this.sets) {
        maxLength = Math.max(set.length, maxLength);

        for (val of set) {
            max = Math.max(max, val);
        }
    }

    for (i = 0; i < maxLength; i++) {
        groups[i] = [];

        for (n = 0; n < this.sets.length; n++) {
            set = this.sets[n];

            groups[i].push({
                value   : set[i],
                percent : (set[i] * 100) / max + '%',
                class   : this.getBarClass(n)
            });
        }
    }

    this.groups = groups;
    this.maxLength = maxLength;
}

function getBarClass(index) {
    if (!this.classes) { return 'bar-' + index; }

    return this.classes[index % this.classes.length];
}