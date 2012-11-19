# Sanity

Sanity is a small script designed to sanity check settings before running your node.js application. Check for values in the environment or specific objects using provided or custom matchers. If the matcher return true, the value is considered passing. Any non-passing values are reported by printing to the output or via a callback function.

## Installation

    npm install sanity

## Usage

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
var sanity = require('sanity');

sanity.check(
  ['GOTTI_BURIAL_LOCATION', 'UNDERCOVER_AGENT'],
  {
    GOTTI_BURIAL_LOCATION: app.unveilTruth('gotti'),
    UNDERCOVER_AGENT: db.get('user', 'type = "undercover"')
  });

// Theoretical output
ERROR: Required settings are not correct!
  GOTTI_BURIAL_LOCATION: undefined
```

Define what happens if values are matches are not true

``` js
var sanity = require('sanity');

sanity.check(['ONE_ARMED_MAN'], null, {
  gagged: true, // default: false
  passiveAggressive: true // default: false
});

// ONE_ARMED_MAN is falsy but `gagged` prevents logging and `passiveAggressive` does not exit the process
```

Supply a callback if you want to control the application flow after checking

``` js
var sanity = require('sanity');

sanity.check(['UFOS'], null, null, function(err, keys) {
  console.error(err); // Same error format as seen before
  console.log(keys) // Array of keys which did not pass
  process.exit(1);
});

## Tests

To run the tests make sure you have [jasmine-node](https://github.com/mhevery/jasmine-node) installed globally, then run this command from the `sanity` folder you cloned into:

    jasmine-node test/