var _ = require('lodash'),
    colors = require('colors/safe'),
    sanity = require('../sanity').sanity,
    sinon = require('sinon'),
    EOL = require('os').EOL;

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
      preachStub = null,
      exitStub = null,
      headingMessage = 'ERROR: Required settings are not correct!';

  beforeEach(function() {
    reporterStub = sinon.stub(sanity, 'reporter');
    preachStub = sinon.stub(sanity, 'preach');
    exitStub = sinon.stub(process, 'exit');
  });

  afterEach(function() {
    callback.reset();
    reporterStub.restore();
    preachStub.restore();
    exitStub.restore();
  });

  describe('Reporter', function() {
    it('styles report by default', function() {
      sanity.check(['ROOFIES']);

      var actual = reporterStub.getCall(0).args[0],
          expected = colors.red(headingMessage) + EOL + '  ' + colors.bold('ROOFIES') + ': undefined';
      expect(actual).toEqual(expected);
    });

    it('uses plain text if styles are configured off', function() {
      sanity.check(['BOREDOM'], {zazz: false});

      var actual = reporterStub.getCall(0).args[0],
          expected = headingMessage + EOL + '  BOREDOM: undefined';
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
      expect(reporterStub.getCall(0).args).toEqual([colors.red(headingMessage) + EOL + '  ' + colors.bold('SOUL') + ': undefined' + EOL + '  ' + colors.bold('HEART') + ': undefined']);
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
      var source = {ANGLE: '27 degrees', DANGLE: true};
      sanity.check(['ANGLE', {key: 'DANGLE', matcher: 'truthy'}], {source: source});

      expect(reporterStub.callCount).toBe(0);
    });
  });

  describe('Callback', function() {
    it('gets fired if provided', function() {
      var options = {
        source: {JUSTICE: 'blind'},
        recover: callback
      };
      sanity.check(['JUSTICE'], options);

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args).toEqual([null, []]);
      expect(exitStub.callCount).toBe(0);
    });

    // TODO: Fix
    xit('recieves error message and bad keys if matches fail', function() {
      sanity.check(['ZIM', 'GIR'], null, null, callback);

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args).toEqual([color.red(headingMessage) + EOL + '  ZIM: undefined' + EOL + '  GIR: undefined', ['ZIM', 'GIR']]);
      expect(exitStub.callCount).toBe(0);
    });
  });

  describe('Configuration options', function() {
    it('mutes output if gag applied', function() {
      sanity.check(['LOTION'], {gagged: true});

      expect(reporterStub.callCount).toBe(0);
      expect(exitStub.callCount).toBe(1);
      expect(exitStub.getCall(0).args).toEqual([1]);
    });

    // TODO: Fix
    xit('does not kill app if passive aggressive', function() {
      sanity.check(['HOWARD_HUGHES'], {passiveAggressive: true});

      expect(reporterStub.callCount).toBe(1);
      expect(reporterStub.getCall(0).args).toEqual([color.red(headingMessage) + EOL + '  HOWARD_HUGHES: undefined']);
      expect(exitStub.callCount).toBe(0);
    });

    it('preaches if given the good books', function() {
      var source = {},
          options = {
            goodBook: {
              'MEANING_OF_LIFE': 42
            },
            source: source
          };

      sanity.check(['MEANING_OF_LIFE'], options);

      expect(preachStub.callCount).toBe(1);
      expect(preachStub.alwaysCalledWithExactly(options.goodBook, options.source)).toBeTruthy();
    });
  });

  describe('Preach', function() {
    beforeEach(function() {
      preachStub.restore();
    });

    it('assigns dictionary to source', function() {
      var source = {},
          sermon = {
            'fanny': 'pack',
            'Lemmy': 'God'
          };

      var result = sanity.preach(sermon, source);

      expect(_.keys(result).length).toBe(2);
      expect(result.fanny).toEqual('pack');
      expect(result.Lemmy).toEqual('God');
    });
  });
});
