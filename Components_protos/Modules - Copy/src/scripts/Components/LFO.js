class LFO {
  constructor(ctx) {
    this.ctx = ctx;

    this.rate = 0;
    this.amplitude = 0;
    this.lfo = ctx.createOscillator();
    //this.audioParam = null;
    this.lfoAmplitude = this.ctx.createGain();
    //this.lfo.connect(this.lfoAmplitude);
  }


  //amplitude is in range [0,1], 1 means 100% of the AudioParam is added/subtracted with lfo
  modulate(audioParams) {
     this.lfo.frequency.value = this.rate;

     for(let i = 0; i <audioParams.length; i++) {
       let lfoAmplitude = this.ctx.createGain();
       this.lfo.connect(lfoAmplitude);
       lfoAmplitude.gain.value = audioParams[i].value * this.amplitude;
       lfoAmplitude.connect(audioParams[i]);
     }
  }

  //audioParam should implement AudioParam interface
  setAmplitude(value) {
    this.amplitude = value;
  }
  //rate is the lfo frequency
  setRate(value) {
    this.rate = value;
  }

  start() {
    this.lfo.start();
  }
  
  //TODO: a separate gain (lfoAmplitude) should be created for each AudioParam since it depends on
  //AudioParam's value. Otherwise the lfoAmplitude is overwritten when multiple AudioParams
  //are being modulated. This chane will affect the .disconnect() method too!
  connect(audioParam) {
    this.lfo.frequency.value = this.rate;
    this.lfoAmplitude.gain.value = audioParam.value * this.amplitude;
    this.lfo.connect(this.lfoAmplitude);
    this.lfoAmplitude.connect(audioParam);
  }
  disconnect(audioParam) {
    try {
      this.lfoAmplitude.disconnect(audioParam);
    } catch(e) {
      console.log(e);
      console.log(audioParam, 'already disconnected');
    }
  }
}
