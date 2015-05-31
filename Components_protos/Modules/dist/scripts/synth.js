(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Oscillator = (function () {
  function Oscillator(ctx) {
    _classCallCheck(this, Oscillator);

    this.wave = 'sine';
    this.gain = 1;
    this.pitch = 0;
    this.ctx = ctx;
    //create VCO (voltage controlled oscillator)
    this.vco = this.ctx.createOscillator();

    //create VCA (voltage controlled amplifier)
    this.vca = this.ctx.createGain();

    //vco->vca->destination
    this.vco.connect(this.vca);
    this.vca.connect(this.ctx.destination);
  }

  _createClass(Oscillator, [{
    key: 'getType',

    //get/set wave type
    value: function getType() {
      return this.vco.type;
    }
  }, {
    key: 'setType',
    value: function setType(wave) {
      this.vco.type = wave;
    }
  }, {
    key: 'getGain',

    //get/set gain
    value: function getGain() {
      return this.vca.gain.value;
    }
  }, {
    key: 'setGain',
    value: function setGain(value) {
      this.vca.gain.value = value;
      this.vca.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    }
  }, {
    key: 'getPitch',

    //get/set pitch
    value: function getPitch() {
      return this.vco.detune.value;
    }
  }, {
    key: 'setPitch',
    value: function setPitch(value) {
      this.vco.detune.value = value;
    }
  }, {
    key: 'getFrequency',

    //get/set frequency
    value: function getFrequency() {
      return this.vco.frequency.value;
    }
  }, {
    key: 'setFrequency',
    value: function setFrequency(value) {
      this.vco.frequency.value = value;
    }
  }, {
    key: 'connect',

    //connect vca->external_node
    value: function connect(node) {
      this.vca.connect(node);
    }
  }, {
    key: 'start',

    //start/stop
    value: function start() {
      var time = arguments[0] === undefined ? 0 : arguments[0];

      this.vco.start(time);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var time = arguments[0] === undefined ? 0 : arguments[0];

      this.vco.stop(time);
    }
  }]);

  return Oscillator;
})();

exports['default'] = Oscillator;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ComponentsOscJs = require('./Components/Osc.js');

var _ComponentsOscJs2 = _interopRequireDefault(_ComponentsOscJs);

var ctx = new AudioContext();
var vco = new _ComponentsOscJs2['default'](ctx);
console.log(vco.getFrequency());
console.log(vco, 1);

},{"./Components/Osc.js":1}]},{},[2])
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Oscillator = (function () {
  function Oscillator(ctx) {
    _classCallCheck(this, Oscillator);

    this.wave = 'sine';
    this.gain = 1;
    this.pitch = 0;
    this.ctx = ctx;
    //create VCO (voltage controlled oscillator)
    this.vco = this.ctx.createOscillator();

    //create VCA (voltage controlled amplifier)
    this.vca = this.ctx.createGain();

    //vco->vca->destination
    this.vco.connect(this.vca);
    this.vca.connect(this.ctx.destination);
  }

  _createClass(Oscillator, [{
    key: 'getType',

    //get/set wave type
    value: function getType() {
      return this.vco.type;
    }
  }, {
    key: 'setType',
    value: function setType(wave) {
      this.vco.type = wave;
    }
  }, {
    key: 'getGain',

    //get/set gain
    value: function getGain() {
      return this.vca.gain.value;
    }
  }, {
    key: 'setGain',
    value: function setGain(value) {
      this.vca.gain.value = value;
      this.vca.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    }
  }, {
    key: 'getPitch',

    //get/set pitch
    value: function getPitch() {
      return this.vco.detune.value;
    }
  }, {
    key: 'setPitch',
    value: function setPitch(value) {
      this.vco.detune.value = value;
    }
  }, {
    key: 'getFrequency',

    //get/set frequency
    value: function getFrequency() {
      return this.vco.frequency.value;
    }
  }, {
    key: 'setFrequency',
    value: function setFrequency(value) {
      this.vco.frequency.value = value;
    }
  }, {
    key: 'connect',

    //connect vca->external_node
    value: function connect(node) {
      this.vca.connect(node);
    }
  }, {
    key: 'start',

    //start/stop
    value: function start() {
      var time = arguments[0] === undefined ? 0 : arguments[0];

      this.vco.start(time);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var time = arguments[0] === undefined ? 0 : arguments[0];

      this.vco.stop(time);
    }
  }]);

  return Oscillator;
})();

exports['default'] = Oscillator;
module.exports = exports['default'];

},{}]},{},[1])
//# sourceMappingURL=synth.js.map