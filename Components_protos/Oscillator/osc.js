
var patch;
var equalTempered440;
window.onload = function() {
  equalTempered440 = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87, 32.70, 34.65, 36.71, 38.89, 41.20, 43.65, 46.25, 49, 51.91, 55, 58.27, 61.74, 65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98, 103.83, 110, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185, 196, 207.65, 220, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760, 1864.66, 1975.53, 2093, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520, 3729.31, 3951.07, 4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040, 7458.62, 7902.13];
	var ctx = new AudioContext();
  var active_voices = {};

  patch = new Patch();

  function onMIDIMessage(event) {
    console.log(event.data);
    var status = event.data[0];
    var note = event.data[1];
    var velocity = event.data[2]/255; //normalize: velocity -> gain: [0,255] -> [0,1]
    var voice;
    if(status !== 144) {
      return; //mod wheel and pitch wheel break the synth - TODO: fix that
    }

    if(velocity > 0) {

      voice = new Voice(note, ctx);
      active_voices[note] = voice;
      voice.start(velocity);
    } else {
      active_voices[note].stop(ctx.currentTime + 3);
      delete active_voices[note];
    }
  }

  //Request midi accsess
  navigator.requestMIDIAccess().then(function(midiAccess) {
    console.log("MIDI ready!");
    var inputs = midiAccess.inputs.values();
    for (var input = inputs.next() ; input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = onMIDIMessage;
    }
  }, function(msg){
    console.log("Failed to get MIDI access - ", msg);
  });

  //Initialize synth
  initSynth();

  //Initialize patch
  initPatch();
};

function initPatch() {
  var params = document.getElementsByClassName('parameter');
  [].forEach.call(params, function(v){


    v.value = patch.getParameter(v.id);
    v.addEventListener('input', function (e){
      //v.dispatchEvent(new Event('onmidimessage'));
      console.log(e.target.id, e.target.value);
      patch.setParameter(e.target.id, e.target.value);

    }, false);
  });
}

function initSynth() {
  var oscProto = Object.create(HTMLElement.prototype);

  oscProto.createdCallback = function() {
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
        value: 0
    });

    var powerControl = HtmlControl.createCheckBox({
      id: this.id + '_power',
      labelText: 'On/Off: ',
      className: 'power'
    });

    //on/off
    this.appendChild(powerControl.label);
    this.appendChild(powerControl.input);

    //gain control
    gainControl.label.setAttribute('for', this.id + '_gain');
    this.appendChild(gainControl.label);
    this.appendChild(gainControl.slider);
    this.appendChild(gainControl.valueIndicator);

    //wave type control
    this.appendChild(waveTypeControl.label);
    this.appendChild(waveTypeControl.select);

    //pitch control
    this.appendChild(pitchControl.label);
    this.appendChild(pitchControl.input)
  };
  document.registerElement('x-osc', {prototype: oscProto});
}

class Patch {
  constructor(){
    this._patch = {
      'Osc1_power': 'on',
      'Osc1_wave': 'square',
      'Osc1_pitch': 0,
      'Osc1_gain': .8
    }
  }

  setParameter(parameter, value) {
    this._patch[parameter] = value;
  }

  getParameter(parameter) {
    return this._patch[parameter];
  }
}

class Voice {
  constructor(note, ctx) {
    this.note = note;
    this.ctx = ctx;
    this.oscillators = [];
  }

  start(velocity) {
    var vco1 = new Oscillator(this.ctx);
    vco1.setType(patch.getParameter('Osc1_wave'));
    vco1.setGain(patch.getParameter('Osc1_gain') * velocity);
    var pitch = +patch.getParameter('Osc1_pitch');
    vco1.setFrequency(equalTempered440[this.note + pitch]);
    //console.log(this.frequency)
    vco1.start();
    this.oscillators.push(vco1);
  }

  stop(time=0) {
    this.oscillators.forEach(function(oscillators){
      oscillators.stop(time);
    });
  }
}

class Oscillator {
  constructor(ctx) {
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

  //get/set wave type
  getType() {
    return this.vco.type;
  }
  setType(wave) {
    this.vco.type = wave;
  }

  //get/set gain
  getGain() {
    return this.vca.gain.value;
  }
  setGain(value) {
    this.vca.gain.value = value;
    this.vca.gain.setTargetAtTime(0, this.ctx.currentTime, .5);
  }

  //get/set pitch
  getPitch() {
    return this.vco.detune.value;
  }
  setPitch(value) {
    this.vco.detune.value = value;
  }

  //get/set frequency
  getFrequency() {
    return this.vco.frequency.value;
  }
  setFrequency(value) {
    this.vco.frequency.value = value;
  }

  //connect vca->external_node
  connect(node) {
    this.vca.connect(node);
  }

  //start/stop
  start(time=0) {
    this.vco.start(time);
  }
  stop(time=0) {
    this.vco.stop(time);
  }
}

class HtmlControl {
  //Slider control
  static createSlider({id, className='', labelText, min, max, step, value, advanced=false} = {}) {
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


    //advanced slider
    if(advanced) {
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
      valueIndicator.addEventListener('input', (e) => {
        slider.value = e.target.value;
      }, false);


      //slider
      slider.classList.remove('parameter');
      slider.addEventListener('input', (e)=>{
        valueIndicator.value = e.target.value;
        valueIndicator.dispatchEvent(new MouseEvent('input'));
      }, false);

      return {slider, label, valueIndicator};
    }

    return {slider};
  }


  static createSelect({id, labelText, options=[]} = {}) {
    var select = document.createElement('select');
    var label = document.createElement('label');
    select.id = id;
    select.className = 'parameter';
    label.setAttribute('for', id);
    label.textContent = labelText;
    for (let i = 0; i < options.length; i++) {
      let option = select.appendChild(document.createElement('option'));
      option.value = options[i];
      option.innerHTML = options[i];
    }

    return {select, label};
  }

  static createNumericTextBox({id, labelText, min = 0, max = 1, value = 1} = {}) {
    var input = document.createElement('input');
    var label = document.createElement('label');
    input.id = id;
    input.className = 'parameter';
    input.setAttribute('type', 'number');
    input.min = min;
    input.max = max;
    input.value = value;
    label.setAttribute('for', id);
    label.textContent = labelText;

    return {input, label};
  }


  static createCheckBox({id, labelText, className} = {}) {
    var input = document.createElement('input');
    var label = document.createElement('label');

    input.id = id;
    input.className = className;
    input.setAttribute('type', 'checkbox');

    label.setAttribute('for', id);
    label.innerHTML = labelText;

    return {input, label};

  }
}
