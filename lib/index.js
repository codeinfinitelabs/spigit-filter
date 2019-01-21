'use strict';

const Joi = require('joi');
const Stream = require('stream');
const Levels = require('./levels');

const internals = {};


class SpigitFilter extends Stream.Transform {

    constructor(options) {

        super({ objectMode: true });
        this.options = internals.processOptions(options);
    }

    _transform(data, encoding, callback) {

        return callback(null, this._filter(data));
    }

    _filter(data) {
        
        if (Levels.default[data.level] <= this.options.level) {
            return data;
        }
    }
};

internals.processOptions = function (options) {

    const _options = options || {};
    const result = Joi.validate(_options, internals.schema);

    if (result.error) {
        throw result.error;
    }

    return {
        level: Levels.default[result.value.log]
    };
};

internals.schema = Joi.object().keys({
    log: Joi.string().valid('info', 'debug', 'warn', 'error', '*').default('*')
});

module.exports = SpigitFilter;