# Sanity

Sanity is a small script designed to sanity check settings before running your node.js application. Check for values in the environment or specific objects using provided or custom matchers. If the matcher return true, the value is considered passing. Any non-passing values are reported by printing to the output or via a callback function.

## Installation

    npm install sanity

## Usage

Here's the signature for sanity:

``` js
sanity.check(
  ['array', 'of', 'keys']
  // Options
  ,
  {
    gagged: false, // "true" will prevent any output
    goodBook: null, // Provide an object literal to set default values to "source"
    passiveAggressive: false, // "true" will not stop app if validation fails
    recover: null, // If a function is provided it is called if validation fails
    source: process.env, // Want to configure another object? Stick it in here. e.g. {gein: 'clown'}
    zazz: true // "false" will show everyone you're a boring person
  }
);
```

Check environment variables are set to a non-empty string value

``` js
var sanity = require('sanity');

sanity.check(['USER', 'MACHTYPE', 'INVISIBLE_FRIENDS', 'AREA_51']);

// Output if INVISIBLE_FRIENDS and AREA_51 are undefined
ERROR: Required settings are not correct!
  INVISIBLE_FRIENDS: undefined
  AREA_51: undefined
```

Use the built-in matchers or provide your own

``` js
var sanity = require('sanity');

sanity.check(
  [{
    key: 'USER',
    matcher: 'defined'
  },
  {
    key: 'TRUTH_IS_OUT_THERE',
    matcher: 'truthy'
  },
  {
    key: 'THERE_WAS_A_SECOND_SHOOTER',
    matcher: 'falsy'
  },
  {
    key: 'TINFOIL_HATS',
    matcher: function() {
      return TinfiolHats.get('all').length > 42;
    }
  }]
);

// Theoretical output
ERROR: Required settings are not correct!
  THERE_WAS_A_SECOND_SHOOTER: true
  TINFOIL_HATS: 3
```

Provide a key/value data source to use other than environment variables

``` js
var sanity = require('sanity'),
    source = {
      GOTTI_BURIAL_LOCATION: app.unveilTruth('gotti'),
      UNDERCOVER_AGENT: db.get('user', 'type = "undercover"')
    };

sanity.check(
  ['GOTTI_BURIAL_LOCATION', 'UNDERCOVER_AGENT'],
  {
    source: source
  }
);

// Theoretical output
ERROR: Required settings are not correct!
  GOTTI_BURIAL_LOCATION: undefined
```

Define what happens if values are matches are not true

``` js
var sanity = require('sanity'),
    options = {
      gagged: true, // default: false
      passiveAggressive: true // default: false
    };

sanity.check(['ONE_ARMED_MAN'], options);

// ONE_ARMED_MAN is falsy but `gagged` prevents logging and `passiveAggressive` does not exit the process
```

Supply a callback if you want to control the application flow after checking

``` js
var sanity = require('sanity'),
    options = {
      recover: function(err, keys) {
        console.error(err); // Same error format as seen before
        console.log(keys) // Array of keys which did not pass
        process.exit(1);
      }
    };

sanity.check(['UFOS'], opttions);

```

## Configuration

There are a few options to change how sanity behaves.

* gagged: Truthy value prevents the reporter from being called. Could be useful in test environments.
* goodBook: An object literal that, if provided, is used automatically to prepopulate the `source`.
* passiveAggressive: If truthy and no callback provided this prevents sanity from running `process.exit(1)` when errors are found.
* recover(message, failedKeys): A funciton that is invoked if validation fails.
* source: Defaults to `process.env` but you can provide any source against which to test keys.
* zazz: Falsy value stops the reported text from looking zazzy.

## Tests

To run the tests make sure you have [jasmine-node](https://github.com/mhevery/jasmine-node) installed globally, then run this command from the `sanity` folder you cloned into:

    npm test
