
window.onload = function() {
  initSynth();
};

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
      value: 0.8,
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


class Oscillator {
  constructor(wave, gain, pitch, ctx) {
    this.wave = wave;
    this.gain = gain;
    this.pitch = pitch;

    //create VCO (voltage controlled oscillator)
    this.vco = ctx.createOscillator();

    //create VCA (voltage controlled amplifier)
    this.vca = ctx.createGain();

    //vco->vca->destination
    this.vco.connect(this.vca);
    thic.vca.connect(ctx.destination);
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
