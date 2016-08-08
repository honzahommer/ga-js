/**
 * @param {String} id
 * @param {Object} [gaOptions]
 * @returns {GAjs}
 */
GAjs.prototype.create = function (id, gaOptions) {
    var that = this;

    this.gaOptions = gaOptions = (typeof gaOptions === 'object') ? gaOptions : {};
    this.namespace = '';
    this.gaObjName = '_ga';
    this.options = {
        debug: false,
        hitCb: {
            pageview: function () {
                var location = window.location;

                if (location.search.indexOf('utm_') != -1 && history.replaceState) {
                    history.replaceState({}, '', location.toString().replace(/(\&|\?)utm([_a-z0-9=]+)/g, ''));
                };
            }
        }
    };

    // separate ga.js options from tracker options
    _for(['debug'], function (option) {
        if (option in gaOptions) {
            that.options[option] = gaOptions[option]
            delete(gaOptions[option])
        }
    });

    // debug global
    _debug = !!this.options.debug;

    if (_validate('id', id) === false) {
        _log('tracking Id looks wrong', 'The tracking Id should only be of the format UA-NNNNNN-N');
    }

    // store the name of the GA object
    window.GoogleAnalyticsObject = this.gaObjName;

    // check whether the GA object is defined
    if ((this.gaObjName in this) === false) {
        // define the GA object
        // and add the tasks to the queue
        this[this.gaObjName] = window[this.gaObjName] = function () {
            (window[that.gaObjName].q = window[that.gaObjName].q || []).push(arguments);
        };

        that[that.gaObjName] = window[that.gaObjName];
    }

    // store the current timestamp
    this[this.gaObjName].l = window[this.gaObjName].l = (new Date()).getTime();

    // store namespace
    _for(arguments, function (argument) {
        if (_typeOf(argument) === 'object' && 'name' in argument) {
            var namespace = argument.name;

            return (that.namespace = namespace, window.GA[namespace] = that, true);
        }
    });

    // create a new script element
    var script = document.createElement('script');
    script.src = 'https://www.google-analytics.com/analytics.js';
    script.async = true;

    // insert the script element into the document
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    // create tracker
    var createTracker = this[this.gaObjName].apply(this, _arguments('unshift', arguments, 'create'));

    // log
    _log('creating tracker', 'New tracker', this.namespace ? '"' + this.namespace + '"' : '' ,'created');

    return this.pageview.call(this);
}
