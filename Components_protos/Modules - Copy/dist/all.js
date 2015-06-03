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
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Filter = (function () {
  function Filter(ctx) {
    _classCallCheck(this, Filter);

    this.ctx = ctx;

    //create filter node
    this.vcf = ctx.createBiquadFilter();
    this.vcf.frequency.value = 900;
    //this.vcf.Q.value = 2;
    this.vcf.type = 'lowpass';
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
      if (bypassed) {
        this.inputNode.disconnect(this.vcf);
        this.inputNode.connect(this.outputNode);
      } else {
        this.inputNode.connect(this.vcf);
        this.inputNode.disconnect(this.outputNode);
      }
    }
  }, {
    key: 'getType',

    //get/set type
    value: function getType() {
      return this.vcf.type;
    }
  }, {
    key: 'setType',
    value: function setType(value) {
      this.vcf.type = value;
    }
  }, {
    key: 'getFrequency',

    //get/set frequency
    value: function getFrequency() {
      return this.vcf.frequency.value;
    }
  }, {
    key: 'setFrequency',
    value: function setFrequency(value) {
      this.vcf.frequency.value = value;
    }
  }, {
    key: 'getGain',

    //get/set gain
    value: function getGain() {
      return this.vcf.gain.value;
    }
  }, {
    key: 'setGain',
    value: function setGain(value) {
      this.vcf.gain.value = value;
    }
  }, {
    key: 'getQ',

    //get/set Q
    value: function getQ() {
      return thid.vcf.Q.value;
    }
  }, {
    key: 'setQ',
    value: function setQ(value) {
      this.vcf.Q.value = value;
    }
  }, {
    key: 'setDryWet',

    //get/set dry/wet
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
      var _ref = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref.id;
      var _ref$className = _ref.className;
      var className = _ref$className === undefined ? '' : _ref$className;
      var labelText = _ref.labelText;
      var min = _ref.min;
      var max = _ref.max;
      var step = _ref.step;
      var value = _ref.value;
      var _ref$advanced = _ref.advanced;
      var advanced = _ref$advanced === undefined ? false : _ref$advanced;

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
      var _ref2 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref2.id;
      var labelText = _ref2.labelText;
      var _ref2$options = _ref2.options;
      var options = _ref2$options === undefined ? [] : _ref2$options;

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
      var _ref3 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref3.id;
      var labelText = _ref3.labelText;
      var _ref3$min = _ref3.min;
      var min = _ref3$min === undefined ? 0 : _ref3$min;
      var _ref3$max = _ref3.max;
      var max = _ref3$max === undefined ? 1 : _ref3$max;
      var _ref3$step = _ref3.step;
      var step = _ref3$step === undefined ? 1 : _ref3$step;
      var _ref3$value = _ref3.value;
      var value = _ref3$value === undefined ? 1 : _ref3$value;

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
      var _ref4 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref4.id;
      var labelText = _ref4.labelText;
      var className = _ref4.className;

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
      this.vco.detune.value = value * 100; //detune is in cents (100cent = 1 semi-tone), but values come fractional, so multiply by 100
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
      'Filter2_dryWet': 0.5
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
  }

  _createClass(Voice, [{
    key: 'start',
    value: function start(velocity) {
      var vco1;
      var vco2;
      var vcf1 = effects['Filter1'];
      var vcf2 = effects['Filter2'];
      if (patch.getParameter('Osc1_on') == true) {
        vco1 = new Oscillator(this.ctx);
        //vcf1 = new Filter(this.ctx);

        vco1.setType(patch.getParameter('Osc1_wave'));
        vco1.setGain(patch.getParameter('Osc1_gain') * velocity);
        vco1.setFrequency(equalTempered440[this.note]); //sdfsdf
        vco1.setPitch(+patch.getParameter('Osc1_pitch'));
        vco1.start();

        //connect
        vco1.setFilterCrossfader(+patch.getParameter('Osc1_F1F2'));
        vco1.out1.connect(vcf1.input);
        vco1.out2.connect(vcf2.input);

        this.oscillators.push(vco1);
      }

      if (patch.getParameter('Osc2_on') == true) {
        vco2 = new Oscillator(this.ctx);
        vco2.setType(patch.getParameter('Osc2_wave'));
        vco2.setGain(patch.getParameter('Osc2_gain') * velocity);
        vco2.setFrequency(equalTempered440[this.note]); //sdfsdf
        vco2.setPitch(+patch.getParameter('Osc2_pitch'));
        vco2.start();

        //connect
        vco2.setFilterCrossfader(+patch.getParameter('Osc2_F1F2'));
        vco2.out1.connect(vcf1.input);
        vco2.out2.connect(vcf2.input);

        this.oscillators.push(vco2);
      }

      vcf1.connect(this.ctx.destination);
      vcf2.connect(this.ctx.destination);
      console.log(this.oscillators);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var time = arguments[0] === undefined ? 0 : arguments[0];

      this.oscillators.forEach(function (oscillators) {
        oscillators.stop(time);
      });
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

  //OnMidiMessage event handler
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
      voice.start(velocity);
    } else {
      active_voices[note].stop(ctx.currentTime + 3);
      delete active_voices[note];
      voice = null;
    }
  }

  //Initialize synth
  initSynth();

  //Initialize patch
  initPatch();

  //Create gloabal effects
  effects['Filter1'] = new Filter(ctx);
  effects['Filter1'].bypass(true);
  effects['Filter2'] = new Filter(ctx);
  effects['Filter2'].bypass(true);
};
//Create global effects function
function createEffects() {}

//Initialize patch function
function initPatch() {
  var params = document.getElementsByClassName('parameter');
  var powers = document.getElementsByClassName('power');
  //extract values from 'parameter'-s and attach event listener to each
  [].forEach.call(params, function (v) {
    v.value = patch.getParameter(v.id); //init value with default patch
    v.addEventListener('input', function (e) {
      var vcf1 = effects['Filter1'];
      var vcf2 = effects['Filter2'];
      patch.setParameter(e.target.id, e.target.value);
      console.log(patch);

      vcf1.setType(patch.getParameter('Filter1_type'));
      vcf1.setFrequency(patch.getParameter('Filter1_frequency'));
      vcf1.setGain(patch.getParameter('Filter1_gain'));
      vcf1.setQ(patch.getParameter('Filter1_Q'));
      vcf1.setDryWet(patch.getParameter('Filter1_dryWet'));

      vcf2.setType(patch.getParameter('Filter2_type'));
      vcf2.setFrequency(patch.getParameter('Filter2_frequency'));
      vcf2.setGain(patch.getParameter('Filter2_gain'));
      vcf2.setQ(patch.getParameter('Filter2_Q'));
      vcf2.setDryWet(patch.getParameter('Filter2_dryWet'));
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

//Initialize synth function
function initSynth() {
  var oscProto;
  var filterProto;

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
}
//# sourceMappingURL=all.js.map