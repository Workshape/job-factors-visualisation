import api from './core/api';
import error from './core/error';
import resolve from './data/resolve';
import Vue from 'vue';
import store from './core/store';

require('./filter/number');

require('./component/relevance-map');
require('./component/interest-bar-chart');
require('./component/bar-chart');

require('./directive/follow-mouse');

function init() {
    new Vue({
        el   : document.body,
        data : () => {
            return {
                samples : null,
                ready   : false
            };
        },
        created() {
            api.responses.get()
            .then((res) => {
                var samples = resolve(res.body.data),
                    data = res.body.data;

                store.setData({
                    data    : data,
                    samples : samples
                });

                this.ready = true;
            }, function () {
                error.handle(new Error('Failed loading data'));
            })
            .catch(error.handle);
        }

    });
}

init();