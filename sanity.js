'use strict';

var _ = require('lodash'),
    os = require('os');

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
        message = '',
        options = options || {
          gagged: false,
          passiveAggressive: false
        };

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
      var errs = ['ERROR: Required settings are not correct!'];
      failures.forEach(function(failure) {
        errs.push('  ' + failure.key + ': ' + failure.value);
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
