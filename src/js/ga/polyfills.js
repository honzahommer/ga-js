/**
 * @param {String} method
 * @param {arguments} args
 * @param {*} item
 * @returns {Array}
 */
if (!'performance' in window) {
    var start = (new Date().getTime());

    window.performance = {
        now: function () {
            return ((new Date().getTime()) - start);
        }
    }
}
