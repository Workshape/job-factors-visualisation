import Vue from 'vue';

Vue.directive('my-directive', { bind, unbind });

function bind() {
    this.onmove = move.bind(this);
    window.addEventListener('mousemove', this.onmove);
}

function unbind() {
    window.removeEventListener('mousemove', this.onmove);
}

function move(e) {
    console.log(e.pageX, e.pageY);
}