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
class Filter {
  constructor(ctx) {
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

  get input() {
    return this.inputNode;
  }

  connect(node) {
    this.outputNode.connect(node);
  }

  bypass(bypassed){
    //this.inputNode.disconnect(this.vcf);
    if(bypassed) {
      this.inputNode.disconnect(this.vcf);
      this.inputNode.connect(this.outputNode);
    } else {
      this.inputNode.connect(this.vcf);
      this.inputNode.disconnect(this.outputNode);
    }

  }

  setType(value) {
    this.vcf.type = value;
  }

  get frequencyAudioParam() {
    return this.vcf.frequency;
  }

  setFrequency(value) {
    this.vcf.frequency.value = value;
  }

  get gainAudioParam() {
    return this.vcf.gain;
  }

  setGain(value) {
    this.vcf.gain.value = value;
  }

  get QAudioParam() {
    return this.vcf.Q;
  }
  setQ(value) {
    this.vcf.Q.value = value;
  }

  //set dry/wet
  //value=1 means 100% wet signal
  setDryWet(value) {
    this.wetGain.gain.value = value;
    this.dryGain.gain.value = 1 - value;
  }
}
