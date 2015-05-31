class Voice {
  constructor(note, ctx) {
    this.note = note;
    this.ctx = ctx;
    this.oscillators = [];
  }

  start(velocity) {
    var vco1;
    if(patch.getParameter('Osc1_on') == true) {
      vco1 = new Oscillator(this.ctx);
      vco1.setType(patch.getParameter('Osc1_wave'));
      vco1.setGain(patch.getParameter('Osc1_gain') * velocity);
      var pitch = +patch.getParameter('Osc1_pitch');
      vco1.setFrequency(equalTempered440[this.note]);//sdfsdf
      vco1.setPitch(pitch);
      vco1.start();
      this.oscillators.push(vco1);
    }
    console.log(this.oscillators)
  }

  stop(time=0) {
    this.oscillators.forEach(function(oscillators){
      oscillators.stop(time);
    });
  }
}
