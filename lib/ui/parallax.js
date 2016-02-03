var y = 0,
    rules = {},
    // FIX_DIST = 1000,
    // MIN_SPACING = 50,
    MOBILE_BREAK = 600;

rules.header = {

    init(el) {
        this.content = el.querySelector('[data-role="content"]');
        this.credits = el.querySelector('[data-role="credits"]');
    },

    scroll(el) {
        var percentA = (y * 500) / (el.offsetHeight / 2),
            percentB = (y * 500) / (el.offsetHeight * 2);

        if (y === 0) {
            this.content.style.opacity = 1;
            this.credits.style.opacity = 0;
            return;
        }

        this.content.style.opacity = 1 - percentA / 100;
        this.credits.style.opacity = percentB / 100;
    }

};

rules['[full-height]'] = {

    resize(el) {
        var windowHeight = window.innerHeight,
            paddingTop;

        el.style.height = '';
        el.style.paddingTop = el.style.paddingBottom = 0;

        var height = el.offsetHeight;

        if (height < windowHeight) {
            paddingTop = (windowHeight - height) / 2;
            el.style.paddingTop = paddingTop + 'px';
            el.style.paddingBottom = paddingTop + 'px';
        } else {
            el.removeAttribute('style');
        }
    }

};

// rules['[fixed-dist]'] = {

//     init(el) {
//         var fixDist = el.getAttribute('fixed-dist');

//         el.fixDist = fixDist ? parseInt(fixDist, 10) : null;
//     },

//     scroll(el) {
//         var fixDist = el.fixDist || FIX_DIST,
//             needScrolling = el.offsetHeight - window.innerHeight,
//             top = el.offsetTop - y,
//             scrollOffset, margin, progress;

//         if (needScrolling < 0) {
//             needScrolling = 0;
//         }

//         if (needScrolling) {
//             delete el.style.marginTop;
//             return;
//         }

//         if (top > 0 && typeof el.fixStarted === 'undefined') {
//             return;
//         }

//         if (typeof el.fixStarted === 'undefined') {
//             el.fixStarted = y + top;
//         }

//         margin = y - el.fixStarted;

//         progress = (margin * 100) / fixDist;

//         if (progress > 100) {
//             progress = 100;
//         }

//         if (margin > fixDist) {
//             margin = fixDist;
//         } else if (margin < 0) {
//             margin = 0;
//         }

//         scrollOffset = needScrolling ? (progress * needScrolling) / 100 : 0;

//         el.style.marginTop = margin - scrollOffset + 'px';
//     },

// };

function init() {
    runHook('init');

    window.addEventListener('scroll', () => {
        runHook('scroll');
    });

    window.addEventListener('resize', () => {
        runHook('resize');
    });

    runHook('resize');
    runHook('scroll');
}

function runHook(hook) {
    var windowWidth = window.innerWidth,
        selector, fn, el, elements, i, hooks;

    y = document.body.scrollTop;

    for (selector in rules) {
        if (!rules.hasOwnProperty(selector)) { continue; }

        hooks = rules[selector];
        fn = hooks[hook];

        if (!fn) { continue; }

        elements = document.querySelectorAll(selector);

        for (i = 0; i < elements.length; i++) {
            el = elements[i];

            if (windowWidth > MOBILE_BREAK) {
                fn.call(hooks, el);
            } else {
                resetElement(el);
            }
        }
    }
}

function resetElement(el) {
    if (el.getAttribute('style')) {
        el.removeAttribute('style');
    }
}

export default { init };