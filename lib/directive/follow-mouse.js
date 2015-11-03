import Vue from 'vue';

Vue.directive('follow-mouse', { bind, unbind });

function bind() {
    this.el.style.position = 'fixed';
    this.onmove = move.bind(this);
    window.addEventListener('mousemove', this.onmove);
}

function unbind() {
    window.removeEventListener('mousemove', this.onmove);
}

function move(e) {
    var scrolled = getScrolled();

    this.el.style.left = e.pageX - scrolled.x + 'px';
    this.el.style.top = e.pageY - scrolled.y + 'px';
}

function getScrolled() {
    var doc = document.documentElement,
        x = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
        y = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    return { x, y };
}