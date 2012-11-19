var sanity = require('../sanity.js'),
    sinon = require('sinon'),
    os = require('os');

describe('Matchers', function() {
  it('has all presets', function() {
    var presets = ['defined', 'truthy', 'falsy'],
        keys = Object.keys(sanity.matchers);

    expect(keys.length).toBe(3);
    presets.forEach(function(preset) {
      expect(keys).toContain(preset);
    });
  });
});

describe('Sanity', function() {
  var callback = sinon.spy(),
      reporterStub = null,
      exitStub = null,
      headingMessage = 'ERROR: Required settings are not correct!'.red + os.EOL;

  beforeEach(function() {
    reporterStub = sinon.stub(sanity, 'reporter');
    exitStub = sinon.stub(process, 'exit');
  });

  afterEach(function() {
    callback.reset();
    reporterStub.restore();
    exitStub.restore();
  });

  describe('Reporter', function() {
    it('styles report by default', function() {
      sanity.check(['ROOFIES']);

      var actual = reporterStub.getCall(0).args[0],
          expected = 'ERROR: Required settings are not correct!'.red + os.EOL + '  ' + 'ROOFIES'.bold + ': undefined';
      expect(actual).toEqual(expected);
    });

    it('uses plain text if styles are configured off', function() {
      sanity.check(['BOREDOM'], null, {zazz: false});

      var actual = reporterStub.getCall(0).args[0],
          expected = 'ERROR: Required settings are not correct!' + os.EOL + '  BOREDOM: undefined';
      expect(actual).toEqual(expected);
    });
  });

  describe('Default configuration', function() {
    it('does not log errors when none are found', function() {
      sanity.check(['USER']);

      expect(reporterStub.callCount).toBe(0);
    });

    it('logs errors when found and exits process', function() {
      sanity.check(['SOUL', 'HEART']);

      expect(reporterStub.callCount).toBe(1);
      expect(reporterStub.getCall(0).args).toEqual([headingMessage + '  ' + 'SOUL'.bold + ': undefined' + os.EOL + '  ' + 'HEART'.bold + ': undefined']);
      expect(exitStub.callCount).toBe(1);
      expect(exitStub.getCall(0).args).toEqual([1]);
    });
  });

  describe('Default Matchers', function() {
    it('understands an empty value', function() {
      expect(sanity.matchers.defined('abc')).toBeTruthy();
      expect(sanity.matchers.defined(null)).toBeFalsy();
      expect(sanity.matchers.defined(undefined)).toBeFalsy();
      expect(sanity.matchers.defined('')).toBeFalsy();
    });

    it('understands a truthy value', function() {
      expect(sanity.matchers.truthy(true)).toBeTruthy();
      expect(sanity.matchers.truthy(false)).toBeFalsy();
      expect(sanity.matchers.truthy('a')).toBeTruthy();
      expect(sanity.matchers.truthy('')).toBeFalsy();
    });

    it('understands a falsy value', function() {
      expect(sanity.matchers.falsy(true)).toBeFalsy();
      expect(sanity.matchers.falsy(false)).toBeTruthy();
      expect(sanity.matchers.falsy('a')).toBeFalsy();
      expect(sanity.matchers.falsy('')).toBeTruthy();
    });
  });

  describe('Custom Matchers', function() {
    it('fires custom matchers', function() {
      var matchSpy = sinon.stub().returns(true);

      sanity.check([{
        key: 'FOO',
        matcher: matchSpy
      }]);

      expect(matchSpy.callCount).toBe(1);
      expect(matchSpy.getCall(0).args).toEqual([undefined]);
    });
  });

  describe('Alternate key/value source', function() {
    it('uses provided data for value lookup on keys', function() {
      sanity.check(['ANGLE', {key: 'DANGLE', matcher: 'truthy'}], {ANGLE: '27 degrees', DANGLE: true});

      expect(reporterStub.callCount).toBe(0);
    });
  });

  describe('Callback', function() {
    it('gets fired if provided', function() {
      sanity.check(['JUSTICE'], {JUSTICE: 'blind'}, null, callback);

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args).toEqual([null, []]);
      expect(exitStub.callCount).toBe(0);
    });

    xit('recieves error message and bad keys if matches fail', function() {
      sanity.check(['ZIM', 'GIR'], null, null, callback);

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args).toEqual([headingMessage + '  ZIM: undefined' + os.EOL + '  GIR: undefined', ['ZIM', 'GIR']]);
      expect(exitStub.callCount).toBe(0);
    });
  });

  describe('Configuration options', function() {
    it('mutes output if gag applied', function() {
      sanity.check(['LOTION'], null, {gagged: true});

      expect(reporterStub.callCount).toBe(0);
      expect(exitStub.callCount).toBe(1);
      expect(exitStub.getCall(0).args).toEqual([1]);
    });

    xit('does not kill app if passive aggressive', function() {
      sanity.check(['HOWARD_HUGHES'], null, {passiveAggressive: true});

      expect(reporterStub.callCount).toBe(1);
      expect(reporterStub.getCall(0).args).toEqual([headingMessage + '  HOWARD_HUGHES: undefined']);
      expect(exitStub.callCount).toBe(0);
    });
  });
});
