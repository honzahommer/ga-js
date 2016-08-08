/**
 * @constructor
 */
var GAjs = function () {
    if (arguments.length !== 0) {
        var create = this.create.apply(this, arguments);
    }

    return this;
};
