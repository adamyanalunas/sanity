'use strict';

var _ = require('lodash'),
    os = require('os'),
    colors = require('colors');

var sanity = {
  reporter: function(report) {
    console.error.call(null, report);
  },
  matchers: {
    defined: function(value) {
      return !_.isEmpty(value);
    },
    truthy: function(value) {
      return !!value;
    },
    falsy: function(value) {
      return !!value === false;
    }
  },
  check: function(required, source, options, cb) {
    var failures = [],
        source = source || process.env,
        message = '';
        options = _.extend({
          gagged: false,
          passiveAggressive: false,
          zazz: true
        }, options);

    required.forEach(function(key) {
      var matcher = sanity.matchers.defined;

      if(typeof key !== 'string') {
        matcher = typeof key.matcher === 'string' ? sanity.matchers[key.matcher] : key.matcher;
        key = key.key;
      }

      if(matcher(source[key]) !== true) {
        failures.push({key: key, value: source[key]});
      }
    });

    if(failures.length > 0) {
      var heading = 'ERROR: Required settings are not correct!',
          errs = [(options.zazz ? heading.red : heading)];
      failures.forEach(function(failure) {
        errs.push('  ' + (options.zazz ? failure.key.bold : failure.key) + ': ' + failure.value);
      });

      message = errs.join(os.EOL);

      if(!options.gagged) {
        this.reporter(message);
      }
    }

    if(typeof cb === 'function') {
      var failedKeys = failures.map(function(entry) {
          return entry.key;
        });
      return cb(message !== '' ? message : null, failedKeys);
    }

    if(!options.passiveAggressive && failures.length > 0) {
      process.exit(1);
    }
  }
};

exports.check = sanity.check;
exports.reporter = sanity.reporter;
exports.matchers = sanity.matchers;
