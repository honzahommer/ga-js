/**
 * @param {(String|Array)} collection
 * @param {...options} options
 * @returns {GAjs}
 */
GAjs.prototype.plugin = GAjs.prototype.require = function (name, options) {
    var namespace = this.namespace;
    var command = [namespace, 'require'].join('.');

    _log('loading plugin', 'Plugin "' + name + '" initialized on tracker', namespace ? '"' + namespace + '"' : '', arguments);

    return (this[this.gaObjName].apply(this, _arguments('unshift', arguments, command)), this);
}
