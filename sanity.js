'use strict';

var assign = require('lodash/assign'),
    forEach = require('lodash/forEach'),
    isEmpty = require('lodash/isEmpty'),
    os = require('os'),
    colors = require('colors');

var sanity = {
  reporter: function(report) {
    console.error.call(null, report);
  },
  matchers: {
    defined: function(value) {
      return !isEmpty(value);
    },
    truthy: function(value) {
      return !!value;
    },
    falsy: function(value) {
      return !!value === false;
    }
  },
  check: function(required, options) {
    var failures = [],
        message = '';
        options = assign({
          gagged: false,
          goodBook: null,
          passiveAggressive: false,
          recover: null,
          source: process.env,
          zazz: true
        }, options);

    if (options.goodBook) {
      sanity.preach(options.goodBook, options.source);
    }

    required.forEach(function(key) {
      var matcher = sanity.matchers.defined;

      if(typeof key !== 'string') {
        matcher = typeof key.matcher === 'string' ? sanity.matchers[key.matcher] : key.matcher;
        key = key.key;
      }

      if(matcher(options.source[key]) !== true) {
        failures.push({key: key, value: options.source[key]});
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

    if(typeof options.recover === 'function') {
      var failedKeys = failures.map(function(entry) {
          return entry.key;
        });
      return options.recover(message !== '' ? message : null, failedKeys);
    }

    if(!options.passiveAggressive && failures.length > 0) {
      process.exit(1);
    }
  },
  preach: function(insights, audience) {
    forEach(insights, function(commandment, word) {
      audience[word] = commandment;
    });

    return audience;
  }
};

exports.sanity = sanity;
exports.check = sanity.check;
exports.reporter = sanity.reporter;
exports.matchers = sanity.matchers;
exports.preach = sanity.preach;
