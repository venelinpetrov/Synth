

  var patch;
  var equalTempered440;
  var effects = {}; // global effects

  window.onload = function() {
    patch = new Patch();
    equalTempered440 = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87, 32.70, 34.65, 36.71, 38.89, 41.20, 43.65, 46.25, 49, 51.91, 55, 58.27, 61.74, 65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98, 103.83, 110, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185, 196, 207.65, 220, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760, 1864.66, 1975.53, 2093, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520, 3729.31, 3951.07, 4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040, 7458.62, 7902.13];

    var ctx = new AudioContext();
    var active_voices = {};

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

    //OnMidiMessage event handler
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
        console.log('-->',ctx)
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
    effects['Filter1'].bypass(true);
    effects['Filter2'] = new Filter(ctx);
    effects['Filter2'].bypass(true);
    effects['Envelope'] = new Envelope(ctx);
    effects['MasterAmp'] = new MasterAmp(ctx);
  }
  //Create global effects function
  function createEffects() {

  }

  //Initialize patch function
  function initPatch() {
    var params = document.getElementsByClassName('parameter');
    var powers = document.getElementsByClassName('power');
    //extract values from 'parameter'-s and attach event listener to each
    [].forEach.call(params, function(v){
      v.value = patch.getParameter(v.id); //init value with default patch
      v.addEventListener('input', function (e){
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
    [].forEach.call(powers, function(v){
      v.checked = patch.getParameter(v.id); //init value with default patch
      v.addEventListener('change', function (e){

        patch.setParameter(e.target.id, e.target.checked);

        console.log(patch);
      }, false);
    });
  }

  //Initialize synth function
  function initSynth() {
    var oscProto;
    var filterProto;
    var envelopeProto;
    var ampProto;

    //Oscillator html rendering
    oscProto = Object.create(HTMLElement.prototype);
    oscProto.createdCallback = function() {
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
          step: .01,
          value: 0
      });

      var f1f2Control = HtmlControl.createSlider({
        id: this.id + '_F1F2',
        min: 0,
        max: 1,
        step: .1,
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
    document.registerElement('x-osc', {prototype: oscProto});

    //Filter html rendering
    filterProto = Object.create(HTMLElement.prototype);
    filterProto.createdCallback = function() {
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
        min: .2,
        max: 30,
        step: .1,
        value: patch.getParameter(this.id + '_Q'),
        advanced: true
      });

      var gainControl = HtmlControl.createSlider({
        id: this.id + '_gain',
        labelText: 'Gain',
        min: -40,
        max: 40,
        step: .1,
        value: patch.getParameter(this.id + '_gain'),
        advanced: true
      });

      var dryWetControl = HtmlControl.createSlider({
        id: this.id + '_dryWet',
        labelText: 'Dry/Wet (%)',
        min: 0,
        max: 1,
        step: .1,
        value: patch.getParameter(this.id + '_dryWet'),
        advanced: true
      });
      var type = patch.getParameter(this.id + '_type');

      //on/off
      this.appendChild(powerControl.label);
      this.appendChild(powerControl.input);
      //handle filter on/off -> pypass it when off
      powerControl.input.addEventListener('change', (function(){
        if(patch.getParameter(this.id + '_on') == false) {
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
      filterTypeControl.select.addEventListener('change', e => {
        var option = e.currentTarget.value;

        //show/hide gain control, since it is not available for all types of filters
        if(option == 'lowpass' ||
            option == 'highpass' ||
            option == 'bandpass' ||
            option == 'notch') {
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

          if(option != 'peaking') {
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
      if(type == 'lowpass' ||
          type == 'highpass' ||
          type == 'bandpass' ||
          type == 'notch') {
        gainControl.label.style.display = 'none';
        gainControl.slider.style.display = 'none';
        gainControl.valueIndicator.style.display = 'none';
      } else {
        if(type != 'peaking') {
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
    document.registerElement('x-filter', {prototype: filterProto});

    //Envelope
    envelopeProto = Object.create(HTMLElement.prototype);
    envelopeProto.createdCallback = function() {
      var attackTimeControl = HtmlControl.createSlider({
        id: this.id + '_attackTime',
        labelText: 'Attack time',
        min: 0,
        max: 4,
        step: .01,
        value: patch.getParameter(this.id + '_attackTime'),
        advanced: true
      });

      var decayTimeControl = HtmlControl.createSlider({
        id: this.id + '_decayTime',
        labelText: 'Decay time',
        min: 0,
        max: 4,
        step: .01,
        value: patch.getParameter(this.id + '_decayTime'),
        advanced: true
      });

      var sustainTimeControl = HtmlControl.createSlider({
        id: this.id + '_sustainLevel',
        labelText: 'Sustain level',
        min: 0,
        max: 1,
        step: .1,
        value: patch.getParameter(this.id + '_sustainLevel'),
        advanced: true
      });

      var releaseTimeControl = HtmlControl.createSlider({
        id: this.id + '_releaseTime',
        labelText: 'Release time',
        min: 0,
        max: 4,
        step: .01,
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
    document.registerElement('x-envelope', {prototype: envelopeProto});

    //Amplifier
    ampProto = Object.create(HTMLElement.prototype);
    ampProto.createdCallback = function() {
      var labelVolume;
      var labelPan;
      var masterGainControl = HtmlControl.createSlider({
        id: this.id + '_masterGain',
        min: 0,
        max: 1,
        step: .1,
        value: patch.getParameter(this.id + '_masterGain'),
        advanced: false
      });

      var panControl = HtmlControl.createSlider({
        id: this.id + '_pan',
        min: -1,
        max: 1,
        step: .1,
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
    document.registerElement('x-amp', {prototype: ampProto});
  }
