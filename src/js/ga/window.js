if (('GA' in window) === false) {
    window.GA = {
        start: start,
        now: function () {
            return Math.round(('performance' in window) ? performance.now() : ((new Date().getTime()) - GA.start));
        }
    };
}

var pkg = window.GA.js = GAjs;

_forEach(GAjs, function(item, key) {
    pkg[key] = item;
});
