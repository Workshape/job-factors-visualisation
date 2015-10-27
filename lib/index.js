import api from './core/api';
import error from './core/error';
import resolve from './data/resolve';
import Vue from 'vue';
import store from './core/store';

require('./component/relevance-map');

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
                store.setData({
                    data    : this.data = res.body.data,
                    samples : resolve(res.body.data)
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