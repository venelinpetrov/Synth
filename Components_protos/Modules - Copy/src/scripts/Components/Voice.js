class Voice {
  constructor(note, ctx) {
    this.note = note;
    this.ctx = ctx;
    this.oscillators = [];
  }

  start(velocity) {
    var vco1;
    var vco2;
    var vcf1 = effects['Filter1'];
    var vcf2 = effects['Filter2'];
    if(patch.getParameter('Osc1_on') == true) {
      vco1 = new Oscillator(this.ctx);
      //vcf1 = new Filter(this.ctx);

      vco1.setType(patch.getParameter('Osc1_wave'));
      vco1.setGain(patch.getParameter('Osc1_gain') * velocity);
      vco1.setFrequency(equalTempered440[this.note]);//sdfsdf
      vco1.setPitch(+patch.getParameter('Osc1_pitch'));
      vco1.start();


      //connect
      vco1.setFilterCrossfader(+patch.getParameter('Osc1_F1F2'));
      vco1.out1.connect(vcf1.input);
      vco1.out2.connect(vcf2.input);

      this.oscillators.push(vco1);
    }

    if(patch.getParameter('Osc2_on') == true) {
      vco2 = new Oscillator(this.ctx);
      vco2.setType(patch.getParameter('Osc2_wave'));
      vco2.setGain(patch.getParameter('Osc2_gain') * velocity);
      vco2.setFrequency(equalTempered440[this.note]);//sdfsdf
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
    console.log(this.oscillators)
  }

  stop(time=0) {
    this.oscillators.forEach(function(oscillators){
      oscillators.stop(time);
    });
  }
}
