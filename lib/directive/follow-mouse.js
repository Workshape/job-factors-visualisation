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
    this.el.style.left = e.pageX + 'px';
    this.el.style.top = e.pageY + 'px';
}