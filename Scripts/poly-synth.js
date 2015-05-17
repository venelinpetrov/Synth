//var keyboard = qwertyHancock({id: 'keyboard'});
"use strict";

window.onload = function () {
	var equalTempered440 = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87, 32.70, 34.65, 36.71, 38.89, 41.20, 43.65, 46.25, 49, 51.91, 55, 58.27, 61.74, 65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98, 103.83, 110, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185, 196, 207.65, 220, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760, 1864.66, 1975.53, 2093, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520, 3729.31, 3951.07, 4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040, 7458.62, 7902.13];


	var context = new AudioContext();

  var Voice = (function(context) {
    function Voice(frequency){
      this.frequency = frequency;
      this.oscillators = [];
    };

    Voice.prototype.start = function(velocity) {
      /* VCO */
      var vco = context.createOscillator();
      vco.type = 'sine';
      vco.frequency.value = this.frequency;

      var vco2 = context.createOscillator();
      vco2.type = 'square';
      vco2.frequency.value = this.frequency;

      /* VCA */
      var vca = context.createGain();
      vca.gain.value = velocity;

      /* connections */
      vco.connect(vca);
      vco2.connect(vca);
      vca.connect(context.destination);

      vco.start(0);
      vco2.start(0);
      this.oscillators.push(vco);
      this.oscillators.push(vco2);
      console.log(this.oscillators);
    };

    Voice.prototype.stop = function() {
      this.oscillators.forEach(function(oscillator) {
        oscillator.stop();
      });
    };

    return Voice;
  })(context);

  var active_voices = {};

	function onMIDIMessage(event) {

		console.log(event.data);
		var status = event.data[0];
		var note = event.data[1];
		var velocity = event.data[2]/255;

    if(status !== 144) {
      return; //mod wheel and pitch wheel break the synth - TODO: fix that
    }
    console.log(active_voices);
    if(velocity > 0) {
      var voice = new Voice(equalTempered440[note + 1]);
      active_voices[note] = voice;
      voice.start(velocity);
    } else {
      active_voices[note].stop();
      delete active_voices[note];
    }
	}

	function onMIDISuccess(midiAccess) {
		console.log("MIDI ready!");
		var inputs = midiAccess.inputs.values();
		for (var input = inputs.next() ; input && !input.done; input = inputs.next()) {
			input.value.onmidimessage = onMIDIMessage;
		}
	}

	function onMIDIFailure(msg) {
		console.log("Failed to get MIDI access - " + msg);
	}

	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}
