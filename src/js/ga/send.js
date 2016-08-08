/**
 * @param {...*} options
 * @returns {GAjs}
 */
GAjs.prototype.send = function () {
    var command = [this.namespace, 'send'].join('.');
    var options = (arguments.length === 0) ? [command] : _arguments('unshift', arguments, command);
    var hitType = options[1];

    _log('calling command', 'Command "' + hitType + '"', 'on tracker', this.namespace ? '"' + this.namespace + '"' : '' ,'called', options);

    return (window[this.gaObjName].apply(this, options), this);
}

// Create shorthand function for send hit types
_for(['pageview', 'event', 'social', 'screenview', 'timing', 'exception'], function (hitType) {
    /**
     * @param {...*} options
     * @returns {GAjs}
     */
    GAjs.prototype[hitType] = function () {
        var options = (arguments.length === 0) ? [hitType] : _arguments('unshift', arguments, hitType);

        if (hitType in this.options.hitCb && _typeOf(this.options.hitCb[hitType]) === 'function') {
            var count = options.length;
            var hitCb = this.options.hitCb[hitType];

            if (count && _typeOf(options[count - 1]) === 'object') {
                options[count - 1].hitCallback = hitCb;
            } else {
                options = _arguments('push', options, {
                    hitCallback: hitCb
                });
            }
        }

        _log('calling hit', 'Hit "' + hitType + '"', 'on tracker', this.namespace ? '"' + this.namespace + '"' : '' ,'called, triggering command "' + [this.namespace, hitType].join('.') + '"');

        return (this.send.apply(this, options), this);
    }
});
