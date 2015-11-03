import Vue from 'vue';
import numberUtil from '../util/number';

Vue.filter('decimals', numberUtil.truncateDecimals);