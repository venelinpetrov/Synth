class Voice {
  constructor(note, ctx) {
    this.note = note;
    this.ctx = ctx;
    this.oscillators = [];
    this.endTime = 0;
  }

  start(velocity) {
    var vco1;
    var vco2;
    var vcf1 = effects['Filter1'];
    var vcf2 = effects['Filter2'];
    var vcoEnvelope = effects['Envelope'];
    var lfo1 = effects['LFO1'];
    var lfo2 = effects['LFO2'];
    var oscModulatedParams = [];
    var filterModulatedParams = [];
    var masterAmp = effects['MasterAmp'];
    if(patch.getParameter('FLO2_Filter1_frequency')) {
      lfo2.connect(vcf1.frequencyAudioParam);
    } else {
      lfo2.disconnect(vcf1.frequencyAudioParam);
    }
    if(patch.getParameter('FLO2_Filter1_gain')) {
      lfo2.connect(vcf1.gainAudioParam);
    } else {
      lfo2.disconnect(vcf1.gainAudioParam);
    }
    if(patch.getParameter('FLO2_Filter1_Q')) {
      lfo2.connect(vcf1.QAudioParam);
    } else {
      lfo2.disconnect(vcf1.QAudioParam);
    }
    if(patch.getParameter('FLO2_Filter2_frequency')) {
      lfo2.connect(vcf2.frequencyAudioParam);
    } else {
      lfo2.disconnect(vcf2.frequencyAudioParam);
    }
    if(patch.getParameter('FLO2_Filter2_gain')) {
      lfo2.connect(vcf2.gainAudioParam);
    } else {
      lfo2.disconnect(vcf2.gainAudioParam);
    }
    if(patch.getParameter('FLO2_Filter2_Q')) {
      lfo2.connect(vcf2.QAudioParam);
    } else {
      lfo2.disconnect(vcf2.QAudioParam);
    }

    if(patch.getParameter('Osc1_on') == true) {
      vco1 = new Oscillator(this.ctx);
      //vco1Envelope = new Envelope(this.ctx);
      vco1.setType(patch.getParameter('Osc1_wave'));
      vco1.setGain(patch.getParameter('Osc1_gain') * velocity);
      vco1.setFrequency(equalTempered440[this.note]);
      vco1.setPitch(+patch.getParameter('Osc1_pitch'));

      //lfo1
      if(patch.getParameter('FLO1_Osc1_gain')) {
        oscModulatedParams.push(vco1.vcaAudioParam);
      }
      if(patch.getParameter('FLO1_Osc1_pitch')) {
        oscModulatedParams.push(vco1.pitchAudioParam);
      }
      if(oscModulatedParams.length != 0) {
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

    if(patch.getParameter('Osc2_on') == true) {
      vco2 = new Oscillator(this.ctx);
      vco2.setType(patch.getParameter('Osc2_wave'));
      vco2.setGain(patch.getParameter('Osc2_gain') * velocity);
      vco2.setFrequency(equalTempered440[this.note]);//sdfsdf
      vco2.setPitch(+patch.getParameter('Osc2_pitch'));

      //lfo1
      if(patch.getParameter('FLO1_Osc2_gain')) {
        oscModulatedParams.push(vco2.vcaAudioParam);
      }
      if(patch.getParameter('FLO1_Osc2_pitch')) {
        oscModulatedParams.push(vco2.pitchAudioParam);
      }
      if(oscModulatedParams.length != 0) {
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


console.log(filterModulatedParams);
    vcf1.connect(masterAmp.input);
    vcf2.connect(masterAmp.input);

  }

  stop() {
    this.oscillators.forEach((oscillator) => {
      //release stage of the envelope <-- ??move this to the Envelope class
      oscillator.vca.gain.setValueAtTime(oscillator.vca.gain.value, this.ctx.currentTime); //hold the sustain gain (preserve from peaking noises and sound flikering)
      oscillator.vca.gain.linearRampToValueAtTime(0, this.ctx.currentTime + this.endTime); //lineary tend to 0 at the specified rate

      oscillator.stop(this.ctx.currentTime + this.endTime); //osc stops when note is dead
    });
  }

  getEndTime() {
    return this.endTime;
  }
}
