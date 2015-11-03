import Vue from 'vue';
import template from '../../views/component/tooltip.jade';

/*
 * Tooltip module
 *
 * Centralised module to control tooltip following the mouse.
 * Exports methods to show, hide and cange the content of the tooltip, which
 * is controlled by a single VM defined below, in the `init` function
 */

var tooltip;

/*
 * Initialise module - Instanciate tooltip VM
 */
exports.init = function () {
    var el = document.getElementById('tooltip');

    el.innerHTML = template;

    tooltip = new Vue({
        el      : el,
        data    : {
            visible : false,
            pos     : { x: 0, y: 0 },
            title   : null,
            text    : null
        },
        ready    : bind,
        methods : {
            mousemove      : mousemove,
            updatePosition : updatePosition
        }
    });
};

/*
 * Bind DOM events
 */
function bind() {
    window.addEventListener('mousemove', this.mousemove.bind(this));
}

/*
 * Triggered on mouse move
 */
function mousemove(e) {
    this.mouse = { x: e.pageX, y: e.pageY };

    if (!this.visible) { return; }

    this.updatePosition();
}

/*
 * Update tooltip position
 */
function updatePosition() {
    this.pos.x = this.mouse.x;
    this.pos.y = this.mouse.y;
}

/*
 * Show tooltip, set text and title to given values
 */
exports.show = function(title, text) {
    if (!tooltip.visible) { tooltip.visible = true; }
    if (title) { tooltip.title = title; }
    if (text) { tooltip.text = text; }
};

/*
 * Hide tooltip, reset text and title
 */
exports.hide = function() {
    tooltip.visible = false;
    tooltip.title = tooltip.text = null;
};