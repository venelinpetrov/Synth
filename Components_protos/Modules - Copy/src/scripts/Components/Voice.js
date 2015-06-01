class Voice {
  constructor(note, ctx) {
    this.note = note;
    this.ctx = ctx;
    this.oscillators = [];
  }

  start(velocity) {
    var vco1, vco2, vcf1;
    if(patch.getParameter('Osc1_on') == true) {
      vco1 = new Oscillator(this.ctx);
      vcf1 = new Filter(this.ctx);
      vco1.connect(vcf1.input);
      vcf1.connect(this.ctx.destination);
      vco1.setType(patch.getParameter('Osc1_wave'));
      vco1.setGain(patch.getParameter('Osc1_gain') * velocity);
      vco1.setFrequency(equalTempered440[this.note]);//sdfsdf
      vco1.setPitch(+patch.getParameter('Osc1_pitch'));
      vco1.start();
      this.oscillators.push(vco1);
    }

    if(patch.getParameter('Osc2_on') == true) {
      vco2 = new Oscillator(this.ctx);
      vco2.setType(patch.getParameter('Osc2_wave'));
      vco2.setGain(patch.getParameter('Osc2_gain') * velocity);
      vco2.setFrequency(equalTempered440[this.note]);//sdfsdf
      vco2.setPitch(+patch.getParameter('Osc2_pitch'));
      vco2.start();
      this.oscillators.push(vco2);
    }
    console.log(this.oscillators)
  }

  stop(time=0) {
    this.oscillators.forEach(function(oscillators){
      oscillators.stop(time);
    });
  }
}
