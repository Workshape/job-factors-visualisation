import extend from 'deep-extend';

/*
 * SVG utility module
 *
 * A small module containing utilities to work with SVG
 */

/*
 * Create and return a SVG path element representing a line with given options
 *
 * @param {[Number]} from
 * @param {[Number]} to
 * @param {Object=} options
 * @return {SVGElement}
 */
function line(from, to, options) {
    options = options || {};

    sanitisePoints(from, to);

    var d = 'M ' + from[0] + ' ' + from[1] + ' L ' + to[0] + ' ' + to[1];

    return svgElement('path', extend(options, {
        x: 0,
        y: 0,
        d: d
    }));
}

/*
 * Create and return a SVG circle element with given options
 *
 * @param {[Number]} center
 * @param {Number} radius
 * @param {Object=} options
 * @return {SVGElement}
 */
function circle(center, radius, options) {
    options = options || {};

    sanitisePoints(center);

    return svgElement('circle', extend(options, {
        cx : center[0],
        cy : center[1],
        r  : radius
    }));
}

/*
 * Create and return a SVG recrangle element with given options
 *
 * @param {[Number]} origin
 * @param {Number} width
 * @param {Number} height
 * @param {Object=} options
 * @return {SVGElement}
 */
function rectangle(origin, width, height, options) {
    options = options || {};

    sanitisePoints(origin);

    return svgElement('rect', extend(options, {
        x      : origin[0],
        y      : origin[1],
        width  : width,
        height : height
    }));
}

/*
 * Create and return a SVG group element with given options
 *
 * @param {Object=} options
 * @return {SVGElement}
 */
function group(options) {
    options = options || {};

    return svgElement('g', options);
}

/*
 * Create and return a SVG text element with given options
 *
 * @param {[Number]} center
 * @param {String} txt
 * @param {Object=} options
 * @return {SVGElement}
 */
function text(center, txt, options) {
    options = options || {};

    sanitisePoints(center);

    return svgElement('text', extend(options, {
        x : center[0],
        y : center[1]
    }), txt);
}

/*
 * Create and return a SVG image element with given options
 *
 * @param {[Number]} origin
 * @param {String} src
 * @param {Object=} options
 * @return {SVGElement}
 */
function image(origin, src, options) {
    options = options || {};

    sanitisePoints(origin);

    var img = svgElement('image', extend(options, {
        'xlink:href'    : src,
        x               : origin[0],
        y               : origin[1]
    }));

    img.el.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src);

    return img;
}

/*
 * Sanitise all values in given Arrays of Numbers representing points
 *
 * @param {[Number]} points..
 */
function sanitisePoints() {
    var i, n, point;

    for (i = 0; i < arguments.length; i++) {
        point = arguments[i];

        for (n = 0; n < point.length; n++) {
            if (point[n] === Infinity) {
                point[n] = 0;
            }
        }
    }
}

/*
 * Create and return an SVG element of given type and set given options as
 * parameters if given - Optionally, set inner content if passed
 *
 * @param {[Number]} type
 * @param {Object=} options
 * @param {String=} content
 * @return {SVGElement}
 */
function svgElement(type, options, content) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', type);

    options = options || {};

    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            el.setAttribute(key, options[key]);
        }
    }

    if (content) {
        el.innerHTML = content;
    }

    return wrap(el);
}

/*
 * Wrap SVG element in API for simple use of this modules functions
 *
 * @param {SVGElement} el
 * @return {Object}
 */
function wrap(el) {

    /*
     * Method to quickly draw other elements onto the SVG element.
     *
     * @param {String} fnName
     * @param {arguments..}
     * @return {SVGElement|void}
     */
    function add(fnName) {
        var args = Array.prototype.slice.call(arguments, 1),
            entity = module.exports[fnName].apply(this, args);

        el.appendChild(entity.el);

        return entity;
    }

    return {
        el  : el,
        add : add
    };
}

/*
 * Create and return a wrapped SVG parent element
 *
 * @param {[Number]} viewboxSize
 * @return {Object}
 */
function svg(viewboxSize) {
    var viewboxStr = '0 0 ' + viewboxSize[0] + ' ' + viewboxSize[1];

    return svgElement('svg', { viewBox: viewboxStr });
}

export default { svg, wrap, svgElement, sanitisePoints, image, text,  group, circle, rectangle, line };