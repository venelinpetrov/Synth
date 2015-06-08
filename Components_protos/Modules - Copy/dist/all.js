'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Delay = (function () {
  function Delay(ctx) {
    _classCallCheck(this, Delay);

    this.ctx = ctx;

    this.delay = this.ctx.createDelay();
    this.inputGain = this.ctx.createGain();
    this.feedbackGain = this.ctx.createGain();
    this.outputGain = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();

    this.inputGain.connect(this.dryGain);
    this.dryGain.connect(this.outputGain);
    this.inputGain.connect(this.wetGain);
    this.wetGain.connect(this.delay);
    this.delay.connect(this.feedbackGain);
    this.feedbackGain.connect(this.outputGain);
    this.feedbackGain.connect(this.delay);
  }

  _createClass(Delay, [{
    key: 'input',
    get: function () {
      return this.inputGain;
    }
  }, {
    key: 'connect',
    value: function connect(node) {
      this.outputGain.connect(node);
    }
  }, {
    key: 'setDelayTime',
    value: function setDelayTime(value) {
      this.delay.delayTime.value = value;
    }
  }, {
    key: 'setFeedbackGain',
    value: function setFeedbackGain(value) {
      this.feedbackGain.gain.value = value;
    }
  }, {
    key: 'setDryWet',

    //value is from 0 to 1, 1 means 100% wet
    value: function setDryWet(value) {
      this.wetGain.gain.value = value;
      this.dryGain.gain.value = 1 - value;
    }
  }, {
    key: 'bypass',
    value: function bypass(bypassed) {
      try {
        if (bypassed) {
          this.inputGain.disconnect(this.dryGain);
          this.inputGain.disconnect(this.wetGain);
          this.inputGain.connect(this.outputGain);
        } else {
          this.inputGain.disconnect(this.outputGain);
          this.inputGain.connect(this.dryGain);
          this.inputGain.connect(this.wetGain);
        }
      } catch (e) {}
    }
  }]);

  return Delay;
})();

/**
  ADSR Envelope class

  A: Attack
  D: Decay
  S: Sustain
  R: Release

  setValueAtTime(value, startTime)
  linearRampToValueAtTime(value, endTime)
  setTargetAtTime(target, startTime, timeConstant)
    -target parameter is the value the parameter will start changing to at the given time.

*/

var Envelope = (function () {
  function Envelope(ctx) {
    _classCallCheck(this, Envelope);

    this.ctx = ctx;
  }

  _createClass(Envelope, [{
    key: 'setADSR',

    //the method currently calculates the total time for which the note is not in sustain state
    //the release phase is independently set in Voice.stop()
    value: function setADSR(audioParam) {
      var _ref = arguments[1] === undefined ? {} : arguments[1];

      var _ref$attackTime = _ref.attackTime;
      var attackTime = _ref$attackTime === undefined ? 0 : _ref$attackTime;
      var _ref$decayTime = _ref.decayTime;
      var decayTime = _ref$decayTime === undefined ? 0 : _ref$decayTime;
      var _ref$sustainLevel = _ref.sustainLevel;
      var sustainLevel = _ref$sustainLevel === undefined ? 1 : _ref$sustainLevel;
      var _ref$releaseTime = _ref.releaseTime;
      var releaseTime = _ref$releaseTime === undefined ? 0 : _ref$releaseTime;

      var now = this.ctx.currentTime;

      //audioParam.cancelScheduledValues(now);
      audioParam.setValueAtTime(0, now);
      //attack phase
      audioParam.linearRampToValueAtTime(audioParam.value, now + attackTime);
      //decay phase and sustain level
      audioParam.linearRampToValueAtTime(audioParam.value * sustainLevel, now + attackTime + decayTime);

      //release phase
      //the release phase is independently set in Voice.stop() via
      //oscillator.vca.gain.linearRampToValueAtTime(0,this.ctx.currentTime + this.endTime);

      return attackTime + decayTime + releaseTime;
    }
  }]);

  return Envelope;
})();

/**
  Filter class

  Filter types

    - lowpass (12dB/octave)  ---\
      @ frequency - the cutoff frequency [HZ]
      @ Q - the resonance [0 to 12] [dB]

    - highpass (12dB/octave)  /---
      @ frequency - the cutoff frequency [HZ]
      @ Q - the resonance [0 to 12] [dB]

    - bandpass (12dB/octave each side)  __/--\__
      @ frequency - the center frequency [HZ]
      @ Q - controls the width of the band. The width becomes narrower as the Q value increases [.2 to 30]

    - lowshelf  --\__
      @ frequnecy - the upper limit of the frequences where the boost (or attenuation) is applied. [Hz]
      @ gain - the boost (+/-) [dB]

    - highshelf  __/--
      @ frequnecy - the lower limit of the frequences where the boost (or attenuation) is applied. [Hz]
      @ gain - the boost (+/-) [dB]

    - peaking  __/\__
      @ frequency - the center frequency of where the boost is applied [Hz]
      @ Q - controls the width of the band of frequencies that are boosted. A large value implies a narrow width [.2 to 30]
      @ gain - the boost (+/-) [dB]

    - notch  --\/--
      @ frequency - the center frequency of where the notch is applied
      @ Q - controls the width of the band of frequencies that are attenuated. A large value implies a narrow width [.2 to 30]

*/

var Filter = (function () {
  function Filter(ctx) {
    _classCallCheck(this, Filter);

    this.ctx = ctx;

    //create filter node
    this.vcf = ctx.createBiquadFilter();
    //dry/wet gains
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();

    //filter component input and output
    this.inputNode = this.ctx.createGain();
    this.outputNode = this.ctx.createGain();

    //connections
    //input --> vcf --> wet --> output-(free out)
    this.inputNode.connect(this.vcf);
    this.vcf.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    //input --> dry --> output-(free out)
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);
  }

  _createClass(Filter, [{
    key: 'input',
    get: function () {
      return this.inputNode;
    }
  }, {
    key: 'connect',
    value: function connect(node) {
      this.outputNode.connect(node);
    }
  }, {
    key: 'bypass',
    value: function bypass(bypassed) {
      //this.inputNode.disconnect(this.vcf);
      try {
        if (bypassed) {
          this.inputNode.disconnect(this.vcf);
          this.inputNode.connect(this.outputNode);
        } else {
          this.inputNode.disconnect(this.outputNode);
          this.inputNode.connect(this.vcf);
        }
      } catch (e) {}
    }
  }, {
    key: 'setType',
    value: function setType(value) {
      this.vcf.type = value;
    }
  }, {
    key: 'frequencyAudioParam',
    get: function () {
      return this.vcf.frequency;
    }
  }, {
    key: 'setFrequency',
    value: function setFrequency(value) {
      this.vcf.frequency.value = value;
    }
  }, {
    key: 'gainAudioParam',
    get: function () {
      return this.vcf.gain;
    }
  }, {
    key: 'setGain',
    value: function setGain(value) {
      this.vcf.gain.value = value;
    }
  }, {
    key: 'QAudioParam',
    get: function () {
      return this.vcf.Q;
    }
  }, {
    key: 'setQ',
    value: function setQ(value) {
      this.vcf.Q.value = value;
    }
  }, {
    key: 'setDryWet',

    //set dry/wet
    //value=1 means 100% wet signal
    value: function setDryWet(value) {
      this.wetGain.gain.value = value;
      this.dryGain.gain.value = 1 - value;
    }
  }]);

  return Filter;
})();

var HtmlControl = (function () {
  function HtmlControl() {
    _classCallCheck(this, HtmlControl);
  }

  _createClass(HtmlControl, null, [{
    key: 'createSlider',

    //Slider control
    value: function createSlider() {
      var _ref2 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref2.id;
      var _ref2$className = _ref2.className;
      var className = _ref2$className === undefined ? '' : _ref2$className;
      var labelText = _ref2.labelText;
      var min = _ref2.min;
      var max = _ref2.max;
      var step = _ref2.step;
      var value = _ref2.value;
      var _ref2$advanced = _ref2.advanced;
      var advanced = _ref2$advanced === undefined ? false : _ref2$advanced;

      var valueIndicator;
      var label;
      var slider = document.createElement('input');

      //simple slider
      slider.setAttribute('type', 'range');
      //slider.id = id;
      slider.className = 'parameter' + ' ' + className;
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;
      if (!advanced) {
        slider.id = id;
      }

      //advanced slider
      if (advanced) {
        //create html elements
        label = document.createElement('label');
        valueIndicator = document.createElement('input');
        valueIndicator.className = 'parameter';

        //label
        label.textContent = labelText;

        //value indicator
        valueIndicator.id = id;
        valueIndicator.setAttribute('type', 'number');
        valueIndicator.min = min;
        valueIndicator.max = max;
        valueIndicator.value = value;
        valueIndicator.step = step;
        valueIndicator.addEventListener('input', function (e) {
          slider.value = e.target.value;
        }, false);

        //slider
        slider.classList.remove('parameter');
        slider.addEventListener('input', function (e) {
          valueIndicator.value = e.target.value;
          valueIndicator.dispatchEvent(new MouseEvent('input'));
        }, false);

        return { slider: slider, label: label, valueIndicator: valueIndicator };
      }

      return { slider: slider };
    }
  }, {
    key: 'createSelect',
    value: function createSelect() {
      var _ref3 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref3.id;
      var labelText = _ref3.labelText;
      var _ref3$options = _ref3.options;
      var options = _ref3$options === undefined ? [] : _ref3$options;

      var select = document.createElement('select');
      var label = document.createElement('label');
      select.id = id;
      select.className = 'parameter';
      label.setAttribute('for', id);
      label.textContent = labelText;
      for (var i = 0; i < options.length; i++) {
        var option = select.appendChild(document.createElement('option'));
        option.value = options[i];
        option.innerHTML = options[i];
      }

      return { select: select, label: label };
    }
  }, {
    key: 'createNumericTextBox',
    value: function createNumericTextBox() {
      var _ref4 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref4.id;
      var labelText = _ref4.labelText;
      var _ref4$min = _ref4.min;
      var min = _ref4$min === undefined ? 0 : _ref4$min;
      var _ref4$max = _ref4.max;
      var max = _ref4$max === undefined ? 1 : _ref4$max;
      var _ref4$step = _ref4.step;
      var step = _ref4$step === undefined ? 1 : _ref4$step;
      var _ref4$value = _ref4.value;
      var value = _ref4$value === undefined ? 1 : _ref4$value;

      var input = document.createElement('input');
      var label = document.createElement('label');
      input.id = id;
      input.className = 'parameter';
      input.setAttribute('type', 'number');
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = value;
      label.setAttribute('for', id);
      label.textContent = labelText;

      return { input: input, label: label };
    }
  }, {
    key: 'createCheckBox',
    value: function createCheckBox() {
      var _ref5 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref5.id;
      var labelText = _ref5.labelText;
      var className = _ref5.className;

      var input = document.createElement('input');
      var label = document.createElement('label');

      input.id = id;
      input.className = className;
      input.setAttribute('type', 'checkbox');

      label.setAttribute('for', id);
      label.innerHTML = labelText;

      return { input: input, label: label };
    }
  }]);

  return HtmlControl;
})();

var LFO = (function () {
  function LFO(ctx) {
    _classCallCheck(this, LFO);

    this.ctx = ctx;

    this.rate = 0;
    this.amplitude = 0;
    this.lfo = ctx.createOscillator();
    this.lfoAmplitude = this.ctx.createGain();
  }

  _createClass(LFO, [{
    key: 'modulate',

    //amplitude is in range [0,1], 1 means 100% of the AudioParam is added/subtracted with lfo
    value: function modulate(audioParams) {
      this.lfo.frequency.value = this.rate;

      for (var i = 0; i < audioParams.length; i++) {
        var lfoAmplitude = this.ctx.createGain();
        this.lfo.connect(lfoAmplitude);
        lfoAmplitude.gain.value = audioParams[i].value * this.amplitude;
        lfoAmplitude.connect(audioParams[i]);
      }
    }
  }, {
    key: 'setAmplitude',

    //audioParam should implement AudioParam interface
    value: function setAmplitude(value) {
      this.amplitude = value;
    }
  }, {
    key: 'setRate',

    //rate is the lfo frequency
    value: function setRate(value) {
      this.rate = value;
    }
  }, {
    key: 'setType',

    //wave type/form
    value: function setType(value) {
      this.lfo.type = value;
    }
  }, {
    key: 'start',
    value: function start() {
      this.lfo.start();
    }
  }, {
    key: 'connect',

    //TODO: a separate gain (lfoAmplitude) should be created for each AudioParam since it depends on
    //AudioParam's value. Otherwise the lfoAmplitude is overwritten when multiple AudioParams
    //are being modulated. This chane will affect the .disconnect() method too!
    value: function connect(audioParam) {
      this.lfo.frequency.value = this.rate;
      this.lfoAmplitude.gain.value = audioParam.value * this.amplitude;
      this.lfo.connect(this.lfoAmplitude);
      this.lfoAmplitude.connect(audioParam);
    }
  }, {
    key: 'disconnect',
    value: function disconnect(audioParam) {
      try {
        this.lfoAmplitude.disconnect(audioParam);
      } catch (e) {}
    }
  }]);

  return LFO;
})();

var MasterAmp = (function () {
  function MasterAmp(ctx) {
    _classCallCheck(this, MasterAmp);

    this.ctx = ctx;

    //nodes
    this.masterGain = this.ctx.createGain();
    this.stereoPanner = this.ctx.createStereoPanner();

    //connections
    this.masterGain.connect(this.stereoPanner);
    this.stereoPanner.connect(this.ctx.destination);
  }

  _createClass(MasterAmp, [{
    key: 'setMasterGain',

    //set masterGain (a.k.a master volume of the synth)
    value: function setMasterGain(value) {
      this.masterGain.gain.value = value;
    }
  }, {
    key: 'setPan',

    //set pan, value is in range -1 to 1, where -1 means all the signal goes left
    //and +1 means all the signal goes right
    value: function setPan(value) {
      this.stereoPanner.pan.value = value;
    }
  }, {
    key: 'input',
    get: function () {
      return this.masterGain;
    }
  }]);

  return MasterAmp;
})();

var Oscillator = (function () {
  function Oscillator(ctx) {
    _classCallCheck(this, Oscillator);

    this.ctx = ctx;
    //create VCO (voltage controlled oscillator)
    this.vco = this.ctx.createOscillator();

    //create VCA (voltage controlled amplifier)
    this.vca = this.ctx.createGain();

    //vco->vca->destination
    this.vco.connect(this.vca);

    //f1/f2 crossfader gains
    this.f1Gain = this.ctx.createGain();
    this.f2Gain = this.ctx.createGain();

    //connect vca to f1Gain and f2Gain
    this.vca.connect(this.f1Gain);
    this.vca.connect(this.f2Gain);
  }

  _createClass(Oscillator, [{
    key: 'getType',

    //get/set wave type
    value: function getType() {
      return this.vco.type;
    }
  }, {
    key: 'setType',
    value: function setType(value) {
      this.vco.type = value;
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
      //this.vca.gain.setTargetAtTime(0, this.ctx.currentTime, .5);
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
      this.vco.detune.value = value * 100; //detune is in cents (100cent = 1 semi-tone), but values come fractional, so multiply by 100
    }
  }, {
    key: 'pitchAudioParam',
    get: function () {
      return this.vco.detune;
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
    key: 'setFilterCrossfader',

    //set crossfader value
    //value=1 means all the output goes to filter1
    value: function setFilterCrossfader(value) {
      this.f1Gain.gain.value = value;
      this.f2Gain.gain.value = 1 - value;
    }
  }, {
    key: 'out1',

    //getters for oscillator outputs
    get: function () {
      return this.f1Gain;
    }
  }, {
    key: 'out2',
    get: function () {
      return this.f2Gain;
    }
  }, {
    key: 'mainVca',
    get: function () {
      return this.vca;
    }
  }, {
    key: 'vcaAudioParam',
    get: function () {
      return this.vca.gain;
    }
  }, {
    key: 'start',

    //connect vca->external_node
    // connect(node) {
    //   this.vca.connect(node);
    // }

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

var Patch = (function () {
  function Patch() {
    _classCallCheck(this, Patch);

    this._patch = {
      'Amp_masterGain': 0.8,
      'Amp_pan': 0,

      'Osc1_on': true,
      'Osc1_wave': 'square',
      'Osc1_pitch': 0,
      'Osc1_gain': 0.8,
      'Osc1_F1F2': 0.5,

      'Osc2_on': false,
      'Osc2_wave': 'sine',
      'Osc2_pitch': 0,
      'Osc2_gain': 0.5,
      'Osc2_F1F2': 0.5,

      'FLO1_Osc1_gain': false,
      'FLO1_Osc2_gain': false,
      'FLO1_Osc1_pitch': false,
      'FLO1_Osc2_pitch': false,
      'LFO1_wave': 'square',
      'LFO1_amplitude': 0,
      'LFO1_rate': 0,

      'FLO2_Filter1_frequency': false,
      'FLO2_Filter2_frequency': false,
      'FLO2_Filter1_gain': false,
      'FLO2_Filter2_gain': false,
      'FLO2_Filter1_Q': false,
      'FLO2_Filter1_Q': false,
      'LFO2_wave': 'sine',
      'LFO2_amplitude': 0,
      'LFO2_rate': 0,

      'Envelope_attackTime': 0,
      'Envelope_decayTime': 0,
      'Envelope_sustainLevel': 0.7,
      'Envelope_releaseTime': 0.06,

      'Filter1_on': false,
      'Filter1_type': 'lowpass',
      'Filter1_frequency': 300,
      'Filter1_Q': 1,
      'Filter1_gain': 0,
      'Filter1_dryWet': 0.5,

      'Filter2_on': false,
      'Filter2_type': 'lowpass',
      'Filter2_frequency': 300,
      'Filter2_Q': 1,
      'Filter2_gain': 0,
      'Filter2_dryWet': 0.5,

      'Delay_on': false,
      'Delay_delayTime': 0.2,
      'Delay_feedback': 0.5,
      'Delay_dryWet': 0.2
    };
  }

  _createClass(Patch, [{
    key: 'setParameter',
    value: function setParameter(parameter, value) {
      this._patch[parameter] = value;
    }
  }, {
    key: 'getParameter',
    value: function getParameter(parameter) {
      return this._patch[parameter];
    }
  }, {
    key: 'getPatch',

    //get/set patch
    //TODO: implement patch import/export
    value: function getPatch() {
      return this._patch;
    }
  }, {
    key: 'setPatch',
    value: function setPatch(patch) {
      this._patch = patch;
    }
  }]);

  return Patch;
})();

var Voice = (function () {
  function Voice(note, ctx) {
    _classCallCheck(this, Voice);

    this.note = note;
    this.ctx = ctx;
    this.oscillators = [];
    this.endTime = 0;
    this.mergerGain = this.ctx.createGain();
  }

  _createClass(Voice, [{
    key: 'start',
    value: function start(velocity) {

      var vco1;
      var vco2;
      var vcf1 = effects['Filter1'];
      var vcf2 = effects['Filter2'];
      var vcoEnvelope = effects['Envelope'];
      var lfo1 = effects['LFO1'];
      var lfo2 = effects['LFO2'];
      var oscModulatedParams = [];
      var delay = effects['Delay'];
      var masterAmp = effects['MasterAmp'];

      if (patch.getParameter('FLO2_Filter1_frequency')) {
        lfo2.connect(vcf1.frequencyAudioParam);
      } else {
        lfo2.disconnect(vcf1.frequencyAudioParam);
      }
      if (patch.getParameter('FLO2_Filter1_gain')) {
        lfo2.connect(vcf1.gainAudioParam);
      } else {
        lfo2.disconnect(vcf1.gainAudioParam);
      }
      if (patch.getParameter('FLO2_Filter1_Q')) {
        lfo2.connect(vcf1.QAudioParam);
      } else {
        lfo2.disconnect(vcf1.QAudioParam);
      }
      if (patch.getParameter('FLO2_Filter2_frequency')) {
        lfo2.connect(vcf2.frequencyAudioParam);
      } else {
        lfo2.disconnect(vcf2.frequencyAudioParam);
      }
      if (patch.getParameter('FLO2_Filter2_gain')) {
        lfo2.connect(vcf2.gainAudioParam);
      } else {
        lfo2.disconnect(vcf2.gainAudioParam);
      }
      if (patch.getParameter('FLO2_Filter2_Q')) {
        lfo2.connect(vcf2.QAudioParam);
      } else {
        lfo2.disconnect(vcf2.QAudioParam);
      }

      if (patch.getParameter('Osc1_on') == true) {
        vco1 = new Oscillator(this.ctx);
        //vco1Envelope = new Envelope(this.ctx);
        vco1.setType(patch.getParameter('Osc1_wave'));
        vco1.setGain(patch.getParameter('Osc1_gain') * velocity);
        vco1.setFrequency(equalTempered440[this.note]);
        vco1.setPitch(+patch.getParameter('Osc1_pitch'));

        //lfo1
        if (patch.getParameter('FLO1_Osc1_gain')) {
          oscModulatedParams.push(vco1.vcaAudioParam);
        }
        if (patch.getParameter('FLO1_Osc1_pitch')) {
          oscModulatedParams.push(vco1.pitchAudioParam);
        }
        if (oscModulatedParams.length != 0) {
          lfo1.modulate(oscModulatedParams);
        }

        //envelope
        this.endTime = vcoEnvelope.setADSR(vco1.vca.gain, {
          attackTime: +patch.getParameter('Envelope_attackTime'),
          decayTime: +patch.getParameter('Envelope_decayTime'),
          sustainLevel: +patch.getParameter('Envelope_sustainLevel'),
          releaseTime: +patch.getParameter('Envelope_releaseTime')
        });

        //connect
        vco1.setFilterCrossfader(+patch.getParameter('Osc1_F1F2'));
        vco1.out1.connect(vcf1.input);
        vco1.out2.connect(vcf2.input);
        vco1.start();

        //track active oscillators, so they can be stoped after that
        this.oscillators.push(vco1);
      }

      if (patch.getParameter('Osc2_on') == true) {
        vco2 = new Oscillator(this.ctx);
        vco2.setType(patch.getParameter('Osc2_wave'));
        vco2.setGain(patch.getParameter('Osc2_gain') * velocity);
        vco2.setFrequency(equalTempered440[this.note]); //sdfsdf
        vco2.setPitch(+patch.getParameter('Osc2_pitch'));

        //lfo1
        if (patch.getParameter('FLO1_Osc2_gain')) {
          oscModulatedParams.push(vco2.vcaAudioParam);
        }
        if (patch.getParameter('FLO1_Osc2_pitch')) {
          oscModulatedParams.push(vco2.pitchAudioParam);
        }
        if (oscModulatedParams.length != 0) {
          lfo1.modulate(oscModulatedParams);
        }
        //envelope
        this.endTime = vcoEnvelope.setADSR(vco2.vca.gain, {
          attackTime: +patch.getParameter('Envelope_attackTime'),
          decayTime: +patch.getParameter('Envelope_decayTime'),
          sustainLevel: +patch.getParameter('Envelope_sustainLevel'),
          releaseTime: +patch.getParameter('Envelope_releaseTime')
        });

        //connect
        vco2.setFilterCrossfader(+patch.getParameter('Osc2_F1F2'));
        vco2.out1.connect(vcf1.input);
        vco2.out2.connect(vcf2.input);
        vco2.start();

        //track active oscillators, so they can be stoped after that
        this.oscillators.push(vco2);
      }

      vcf1.connect(delay.input);
      vcf2.connect(delay.input);
      delay.connect(masterAmp.input);
      //delay.setFeedbackGain(0.3 * velocity);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var _this = this;

      this.oscillators.forEach(function (oscillator) {
        //release stage of the envelope <-- ??move this to the Envelope class
        oscillator.vca.gain.setValueAtTime(oscillator.vca.gain.value, _this.ctx.currentTime); //hold the sustain gain (preserve from peaking noises and sound flikering)
        oscillator.vca.gain.linearRampToValueAtTime(0, _this.ctx.currentTime + _this.endTime); //lineary tend to 0 at the specified rate

        oscillator.stop(_this.ctx.currentTime + _this.endTime); //osc stops when note is dead
      });
    }
  }, {
    key: 'getEndTime',
    value: function getEndTime() {
      return this.endTime;
    }
  }]);

  return Voice;
})();

var patch;
var equalTempered440;
var effects = {}; // global effects

window.onload = function () {

  patch = new Patch();

  equalTempered440 = [16.35, 17.32, 18.35, 19.45, 20.6, 21.83, 23.12, 24.5, 25.96, 27.5, 29.14, 30.87, 32.7, 34.65, 36.71, 38.89, 41.2, 43.65, 46.25, 49, 51.91, 55, 58.27, 61.74, 65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98, 103.83, 110, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185, 196, 207.65, 220, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880, 932.33, 987.77, 1046.5, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760, 1864.66, 1975.53, 2093, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520, 3729.31, 3951.07, 4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040, 7458.62, 7902.13];

  var ctx = new AudioContext();
  var active_voices = {};

  //Import settings
  document.getElementById('upload').onchange = function () {
    var fr = new FileReader();
    fr.onload = function () {
      patch.setPatch(JSON.parse(this.result));

      //Initialize patch
      initPatch();

      //Initialize effects
      initEffects();

      [].forEach.call(document.getElementsByClassName('power'), function (v) {
        v.checked = patch.getParameter(v.id); //init value with default patch
        v.addEventListener('change', function (e) {
          patch.setParameter(e.target.id, e.target.checked);
          console.log(patch);
        }, false);
      });
      console.log(this.result);
    };
    fr.readAsText(this.files[0]);
  };

  //Request midi accsess
  navigator.requestMIDIAccess().then(function (midiAccess) {
    console.log('MIDI ready!');
    var inputs = midiAccess.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = onMIDIMessage;
    }
  }, function (msg) {
    console.log('Failed to get MIDI access - ', msg);
  });

  //onmidimessage event handler
  function onMIDIMessage(event) {
    console.log(event.data);
    var status = event.data[0];
    var note = event.data[1];
    var velocity = event.data[2] / 255; //normalize: velocity -> gain: [0,255] -> [0,1]
    var voice;
    if (status !== 144) {
      return; //mod wheel and pitch wheel break the synth - TODO: fix that
    }

    if (velocity > 0) {
      console.log('-->', ctx);
      voice = new Voice(note, ctx);
      active_voices[note] = voice;
      console.log(active_voices);
      voice.start(velocity);
    } else {
      active_voices[note].stop();
      delete active_voices[note];
      //voice = null;
    }
  }

  //Initialize synth
  initSynth();

  //Initialize patch
  initPatch();

  //Create gloabal effects
  effects['Filter1'] = new Filter(ctx);
  effects['Filter2'] = new Filter(ctx);

  effects['Envelope'] = new Envelope(ctx);
  effects['MasterAmp'] = new MasterAmp(ctx);

  effects['LFO1'] = new LFO(ctx);
  effects['LFO1'].start();
  // effects['LFO1'].setType(patch.getParameter('LFO1_wave'));
  // effects['LFO1'].setAmplitude(+patch.getParameter('LFO1_amplitude'));
  // effects['LFO1'].setRate(+patch.getParameter('LFO1_rate'));

  effects['LFO2'] = new LFO(ctx);
  effects['LFO2'].start();
  // effects['LFO2'].setType(patch.getParameter('LFO1_wave'));
  // effects['LFO2'].setAmplitude(+patch.getParameter('LFO2_amplitude'));
  // effects['LFO2'].setRate(+patch.getParameter('LFO2_rate'));

  effects['Delay'] = new Delay(ctx);

  initEffects();
};

//Initialize patch function
function initPatch() {
  var params = document.getElementsByClassName('parameter');
  var powers = document.getElementsByClassName('power');
  //extract values from 'parameter'-s and attach event listener to each
  [].forEach.call(params, function (v) {
    v.value = patch.getParameter(v.id); //init value with default patch
    v.addEventListener('input', function (e) {
      patch.setParameter(e.target.id, e.target.value); //html to patch
      initEffects();
    }, false);
  });

  //extract values from on/off buttons
  [].forEach.call(powers, function (v) {
    v.checked = patch.getParameter(v.id); //init value with default patch
    v.addEventListener('change', function (e) {
      patch.setParameter(e.target.id, e.target.checked);
      console.log(patch);
    }, false);
  });
}

function initEffects() {
  var vcf1 = effects['Filter1'];
  var vcf2 = effects['Filter2'];

  var lfo1 = effects['LFO1'];
  var lfo2 = effects['LFO2'];

  var delay = effects['Delay'];

  var masterAmp = effects['MasterAmp'];

  console.log(patch);
  //Oscillators
  // --> initialized in Voice

  //Filters
  if (patch.getParameter('Filter1_on') == false) {
    vcf1.bypass(true);
  } else {
    vcf1.bypass(false);
  }
  vcf1.setType(patch.getParameter('Filter1_type'));
  vcf1.setFrequency(patch.getParameter('Filter1_frequency'));
  vcf1.setGain(patch.getParameter('Filter1_gain'));
  vcf1.setQ(patch.getParameter('Filter1_Q'));
  vcf1.setDryWet(patch.getParameter('Filter1_dryWet'));

  if (patch.getParameter('Filter2_on') == false) {
    vcf2.bypass(true);
  } else {
    vcf2.bypass(false);
  }
  vcf2.setType(patch.getParameter('Filter2_type'));
  vcf2.setFrequency(patch.getParameter('Filter2_frequency'));
  vcf2.setGain(patch.getParameter('Filter2_gain'));
  vcf2.setQ(patch.getParameter('Filter2_Q'));
  vcf2.setDryWet(patch.getParameter('Filter2_dryWet'));

  //Envelope
  // --> initialized in Voice

  //LFO1 (Oscillators)
  lfo1.setType(patch.getParameter('LFO1_wave'));
  lfo1.setAmplitude(+patch.getParameter('LFO1_amplitude'));
  lfo1.setRate(+patch.getParameter('LFO1_rate'));

  //LFO2 (Filters)
  lfo2.setType(patch.getParameter('LFO2_wave'));
  lfo2.setAmplitude(+patch.getParameter('LFO2_amplitude'));
  lfo2.setRate(+patch.getParameter('LFO2_rate'));

  //Delay
  if (patch.getParameter('Delay_on') == false) {
    effects['Delay'].bypass(true);
  }
  delay.setDelayTime(+patch.getParameter('Delay_delayTime'));
  delay.setFeedbackGain(+patch.getParameter('Delay_feedback'));
  delay.setDryWet(+patch.getParameter('Delay_dryWet'));

  //Master amp
  masterAmp.setPan(patch.getParameter('Amp_pan'));
  masterAmp.setMasterGain(patch.getParameter('Amp_masterGain'));
}

//Render and initialize synth
function initSynth() {
  var oscProto;
  var filterProto;
  var envelopeProto;
  var oscLFOProto;
  var filterLFOProto;
  var delayProto;
  var ampProto;

  //Oscillator html rendering
  oscProto = Object.create(HTMLElement.prototype);
  oscProto.createdCallback = function () {
    var powerControl = HtmlControl.createCheckBox({
      id: this.id + '_on',
      labelText: 'On/Off: ',
      className: 'power'
    });
    var gainControl = HtmlControl.createSlider({
      id: this.id + '_gain',
      advanced: true,
      labelText: 'Amp: ',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_gain'),
      className: 'slider'
    });

    var waveTypeControl = HtmlControl.createSelect({
      id: this.id + '_wave',
      labelText: 'Wave Type: ',
      options: ['sine', 'square', 'triangle', 'sawtooth']
    });

    var pitchControl = HtmlControl.createNumericTextBox({
      id: this.id + '_pitch',
      labelText: 'Pitch: ',
      min: -64,
      max: 64,
      step: 0.01,
      value: 0
    });

    var f1f2Control = HtmlControl.createSlider({
      id: this.id + '_F1F2',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_F1F2'),
      advanced: false
    });

    //on/off control
    this.appendChild(powerControl.label);
    this.appendChild(powerControl.input);

    //wave type control
    this.appendChild(waveTypeControl.label);
    this.appendChild(waveTypeControl.select);

    //pitch control
    this.appendChild(pitchControl.label);
    this.appendChild(pitchControl.input);

    //gain control
    gainControl.label.setAttribute('for', this.id + '_gain');
    this.appendChild(gainControl.label);
    this.appendChild(gainControl.slider);
    this.appendChild(gainControl.valueIndicator);

    //F1F2 control
    this.appendChild(f1f2Control.slider);

    console.log('Oscillator created');
  };
  document.registerElement('x-osc', { prototype: oscProto });

  //Filter html rendering
  filterProto = Object.create(HTMLElement.prototype);
  filterProto.createdCallback = function () {
    var powerControl = HtmlControl.createCheckBox({
      id: this.id + '_on',
      labelText: 'On/Off: ',
      className: 'power'
    });
    var filterTypeControl = HtmlControl.createSelect({
      id: this.id + '_type',
      labelText: 'Filter Type: ',
      options: ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch']
    });

    var frequencyControl = HtmlControl.createSlider({
      id: this.id + '_frequency',
      labelText: 'Frequency',
      min: 20,
      max: 20000,
      step: 10,
      value: patch.getParameter(this.id + '_frequency'),
      advanced: true
    });

    var QControl = HtmlControl.createSlider({
      id: this.id + '_Q',
      labelText: 'Q',
      min: 0.2,
      max: 30,
      step: 0.1,
      value: patch.getParameter(this.id + '_Q'),
      advanced: true
    });

    var gainControl = HtmlControl.createSlider({
      id: this.id + '_gain',
      labelText: 'Gain',
      min: -40,
      max: 40,
      step: 0.1,
      value: patch.getParameter(this.id + '_gain'),
      advanced: true
    });

    var dryWetControl = HtmlControl.createSlider({
      id: this.id + '_dryWet',
      labelText: 'Dry/Wet (%)',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_dryWet'),
      advanced: true
    });
    var type = patch.getParameter(this.id + '_type');

    //on/off
    this.appendChild(powerControl.label);
    this.appendChild(powerControl.input);
    //handle filter on/off -> pypass it when off
    powerControl.input.addEventListener('change', (function () {
      if (patch.getParameter(this.id + '_on') == false) {
        effects[this.id].bypass(false);
        console.log('bypass on', this.id);
      } else {
        effects[this.id].bypass(true);
        console.log('bypass off', this.id);
      }
    }).bind(this), false);

    //filter type control
    this.appendChild(filterTypeControl.label);
    this.appendChild(filterTypeControl.select);
    filterTypeControl.select.addEventListener('change', function (e) {
      var option = e.currentTarget.value;

      //show/hide gain control, since it is not available for all types of filters
      if (option == 'lowpass' || option == 'highpass' || option == 'bandpass' || option == 'notch') {
        //hide gain control
        gainControl.label.style.display = 'none';
        gainControl.slider.style.display = 'none';
        gainControl.valueIndicator.style.display = 'none';

        QControl.label.style.display = '';
        QControl.slider.style.display = '';
        QControl.valueIndicator.style.display = '';
      } else {
        //show gain control
        gainControl.label.style.display = '';
        gainControl.slider.style.display = '';
        gainControl.valueIndicator.style.display = '';

        if (option != 'peaking') {
          QControl.label.style.display = 'none';
          QControl.slider.style.display = 'none';
          QControl.valueIndicator.style.display = 'none';
        } else {
          QControl.label.style.display = '';
          QControl.slider.style.display = '';
          QControl.valueIndicator.style.display = '';
        }
      }
    });

    //frequency control
    this.appendChild(frequencyControl.label);
    this.appendChild(frequencyControl.slider);
    this.appendChild(frequencyControl.valueIndicator);

    //Q control
    this.appendChild(QControl.label);
    this.appendChild(QControl.slider);
    this.appendChild(QControl.valueIndicator);

    //gain control
    this.appendChild(gainControl.label);
    this.appendChild(gainControl.slider);
    this.appendChild(gainControl.valueIndicator);
    if (type == 'lowpass' || type == 'highpass' || type == 'bandpass' || type == 'notch') {
      gainControl.label.style.display = 'none';
      gainControl.slider.style.display = 'none';
      gainControl.valueIndicator.style.display = 'none';
    } else {
      if (type != 'peaking') {
        QControl.label.style.display = 'none';
        QControl.slider.style.display = 'none';
        QControl.valueIndicator.style.display = 'none';
      }
    }

    //dry/wet control
    this.appendChild(dryWetControl.label);
    this.appendChild(dryWetControl.slider);
    this.appendChild(dryWetControl.valueIndicator);

    console.log('Filter created');
  };
  document.registerElement('x-filter', { prototype: filterProto });

  //Envelope
  envelopeProto = Object.create(HTMLElement.prototype);
  envelopeProto.createdCallback = function () {
    var attackTimeControl = HtmlControl.createSlider({
      id: this.id + '_attackTime',
      labelText: 'Attack time',
      min: 0,
      max: 4,
      step: 0.01,
      value: patch.getParameter(this.id + '_attackTime'),
      advanced: true
    });

    var decayTimeControl = HtmlControl.createSlider({
      id: this.id + '_decayTime',
      labelText: 'Decay time',
      min: 0,
      max: 4,
      step: 0.01,
      value: patch.getParameter(this.id + '_decayTime'),
      advanced: true
    });

    var sustainTimeControl = HtmlControl.createSlider({
      id: this.id + '_sustainLevel',
      labelText: 'Sustain level',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_sustainLevel'),
      advanced: true
    });

    var releaseTimeControl = HtmlControl.createSlider({
      id: this.id + '_releaseTime',
      labelText: 'Release time',
      min: 0,
      max: 4,
      step: 0.01,
      value: patch.getParameter(this.id + '_releaseTime'),
      advanced: true
    });
    //attack
    this.appendChild(attackTimeControl.label);
    this.appendChild(attackTimeControl.slider);
    this.appendChild(attackTimeControl.valueIndicator);

    //decay
    this.appendChild(decayTimeControl.label);
    this.appendChild(decayTimeControl.slider);
    this.appendChild(decayTimeControl.valueIndicator);

    //sustain
    this.appendChild(sustainTimeControl.label);
    this.appendChild(sustainTimeControl.slider);
    this.appendChild(sustainTimeControl.valueIndicator);

    //release
    this.appendChild(releaseTimeControl.label);
    this.appendChild(releaseTimeControl.slider);
    this.appendChild(releaseTimeControl.valueIndicator);
  };
  document.registerElement('x-envelope', { prototype: envelopeProto });

  //LFO1
  oscLFOProto = Object.create(HTMLElement.prototype);
  oscLFOProto.createdCallback = function () {
    var waveTypeControl = HtmlControl.createSelect({
      id: this.id + '_wave',
      labelText: 'Wave Type ',
      options: ['sine', 'square', 'triangle', 'sawtooth']
    });

    var amplitudeControl = HtmlControl.createSlider({
      id: this.id + '_amplitude',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_amplitude'),
      advanced: false
    });
    var amplitudeLabel;

    var rateControl = HtmlControl.createSlider({
      id: this.id + '_rate',
      min: 0,
      max: 20,
      step: 0.1,
      value: patch.getParameter(this.id + '_rate'),
      advanced: false
    });
    var rateLabel;
    var routingTable;

    //wave form
    this.appendChild(waveTypeControl.label);
    this.appendChild(waveTypeControl.select);

    //amplitude
    amplitudeLabel = document.createElement('label');
    amplitudeLabel.innerHTML = 'Amplitude';
    this.appendChild(amplitudeLabel);
    this.appendChild(amplitudeControl.slider);

    //rate
    rateLabel = document.createElement('label');
    rateLabel.innerHTML = 'Rate';
    this.appendChild(rateLabel);
    this.appendChild(rateControl.slider);

    //routing table
    routingTable = document.createElement('table');
    //lazy render - maybe fix later
    routingTable.innerHTML = '<tr><td></td><th>Osc 1</th><th>Osc 2</th></tr><tr><th>Amp</th><td><input type="checkbox" id="FLO1_Osc1_gain" class="power"></td><td><input type="checkbox" id="FLO1_Osc2_gain" class="power"></td></tr><tr><th>Pitch</th><td><input type="checkbox" id="FLO1_Osc1_pitch" class="power"></td><td><input type="checkbox" id="FLO1_Osc2_pitch" class="power"></td></tr>';
    this.appendChild(routingTable);
  };
  document.registerElement('x-osc-lfo', { prototype: oscLFOProto });

  //LFO2
  filterLFOProto = Object.create(HTMLElement.prototype);
  filterLFOProto.createdCallback = function () {
    var waveTypeControl = HtmlControl.createSelect({
      id: this.id + '_wave',
      labelText: 'Wave Type ',
      options: ['sine', 'square', 'triangle', 'sawtooth']
    });

    var amplitudeControl = HtmlControl.createSlider({
      id: this.id + '_amplitude',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_amplitude'),
      advanced: false
    });
    var amplitudeLabel;

    var rateControl = HtmlControl.createSlider({
      id: this.id + '_rate',
      min: 0,
      max: 20,
      step: 0.1,
      value: patch.getParameter(this.id + '_rate'),
      advanced: false
    });
    var rateLabel;
    var routingTable;

    //wave type
    this.appendChild(waveTypeControl.label);
    this.appendChild(waveTypeControl.select);

    //amplitude
    amplitudeLabel = document.createElement('label');
    amplitudeLabel.innerHTML = 'Amplitude';
    this.appendChild(amplitudeLabel);
    this.appendChild(amplitudeControl.slider);

    //rate
    rateLabel = document.createElement('label');
    rateLabel.innerHTML = 'Rate';
    this.appendChild(rateLabel);
    this.appendChild(rateControl.slider);

    //routing table
    routingTable = document.createElement('table');
    //lazy render - maybe fix later
    routingTable.innerHTML = '<tr><td></td><th>Filter 1</th><th>Filter 2</th></tr><tr><th>Frequency</th><td><input type="checkbox" id="FLO2_Filter1_frequency" class="power"></td><td><input type="checkbox" id="FLO2_Filter2_frequency" class="power"></td></tr><tr><th>Gain</th><td><input type="checkbox" id="FLO2_Filter1_gain" class="power"></td><td><input type="checkbox" id="FLO2_Filter2_gain" class="power"></td></tr><tr><th>Q</th><td><input type="checkbox" id="FLO2_Filter1_Q" class="power"></td><td><input type="checkbox" id="FLO2_Filter1_Q" class="power"></td></tr>';
    this.appendChild(routingTable);
  };
  document.registerElement('x-filter-lfo', { prototype: filterLFOProto });

  //Amplifier
  delayProto = Object.create(HTMLElement.prototype);
  delayProto.createdCallback = function () {
    var delayTimeLabel;
    var feedbackLabel;
    var dryWetLabel;

    var powerControl = HtmlControl.createCheckBox({
      id: this.id + '_on',
      labelText: 'On/Off: ',
      className: 'power'
    });

    var delayTimeControl = HtmlControl.createSlider({
      id: this.id + '_delayTime',
      min: 0,
      max: 5,
      step: 0.01,
      value: patch.getParameter(this.id + '_delayTime'),
      advanced: false
    });

    var feedbackControl = HtmlControl.createSlider({
      id: this.id + '_feedback',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_feedback'),
      advanced: false
    });

    var dryWetControl = HtmlControl.createSlider({
      id: this.id + '_dryWet',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_dryWet'),
      advanced: false
    });

    //power
    this.appendChild(powerControl.label);
    this.appendChild(powerControl.input);
    powerControl.input.addEventListener('change', (function () {
      if (patch.getParameter(this.id + '_on') == false) {
        effects[this.id].bypass(false);
        console.log('bypass on', this.id);
      } else {
        effects[this.id].bypass(true);
        console.log('bypass off', this.id);
      }
    }).bind(this), false);

    //delay time
    delayTimeLabel = document.createElement('label');
    delayTimeLabel.innerHTML = 'Delay time';
    this.appendChild(delayTimeLabel);
    this.appendChild(delayTimeControl.slider);

    //feedback
    feedbackLabel = document.createElement('label');
    feedbackLabel.innerHTML = 'Feedback';
    this.appendChild(feedbackLabel);
    this.appendChild(feedbackControl.slider);

    //dry/wet
    dryWetLabel = document.createElement('label');
    dryWetLabel.innerHTML = 'Dry/Wet';
    this.appendChild(dryWetLabel);
    this.appendChild(dryWetControl.slider);
  };
  document.registerElement('x-delay', { prototype: delayProto });

  //Amplifier
  ampProto = Object.create(HTMLElement.prototype);
  ampProto.createdCallback = function () {
    var labelVolume;
    var labelPan;
    var masterGainControl = HtmlControl.createSlider({
      id: this.id + '_masterGain',
      min: 0,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_masterGain'),
      advanced: false
    });

    var panControl = HtmlControl.createSlider({
      id: this.id + '_pan',
      min: -1,
      max: 1,
      step: 0.1,
      value: patch.getParameter(this.id + '_pan'),
      advanced: false
    });

    //master gain
    labelVolume = document.createElement('label');
    labelVolume.innerHTML = 'Volume';
    this.appendChild(labelVolume);
    this.appendChild(masterGainControl.slider);

    //pan
    labelPan = document.createElement('label');
    labelPan.innerHTML = 'Pan';
    this.appendChild(labelPan);
    this.appendChild(panControl.slider);
  };
  document.registerElement('x-amp', { prototype: ampProto });
}

//console.log('delay bypass-->', e);

//console.log('filter bypass-->', e);

// console.log(e);
// console.log(audioParam, 'already disconnected');
//# sourceMappingURL=all.js.map