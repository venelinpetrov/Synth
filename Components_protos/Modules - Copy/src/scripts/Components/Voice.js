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
