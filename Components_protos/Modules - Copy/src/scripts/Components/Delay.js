class Delay {
  constructor(ctx) {
    this.ctx = ctx;

    this.delay = this.ctx.createDelay();
    this.inputGain = this.ctx.createGain();
    this.feedbackGain = this.ctx.createGain();
    this.outputGain = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();

    this.inputGain.connect(this.dryGain);
    this.dryGain.connect(this.outputGain);
    this.inputGain.connect(this.wetGain);
    this.wetGain.connect(this.delay);
    this.delay.connect(this.feedbackGain);
    this.feedbackGain.connect(this.outputGain);
    this.feedbackGain.connect(this.delay);
  }

  get input() {
    return this.inputGain;
  }

  connect(node) {
    this.outputGain.connect(node);
  }

  setDelayTime(value) {
    this.delay.delayTime.value = value;
  }

  setFeedbackGain(value) {
    this.feedbackGain.gain.value = value
  }

  //value is from 0 to 1, 1 means 100% wet
  setDryWet(value) {
    this.wetGain.gain.value = value;
    this.dryGain.gain.value = 1 - value;
  }

  bypass(bypassed) {
    try {
      if(bypassed) {
        this.inputGain.disconnect(this.dryGain);
        this.inputGain.disconnect(this.wetGain);
        this.inputGain.connect(this.outputGain);
      } else {
        this.inputGain.disconnect(this.outputGain);
        this.inputGain.connect(this.dryGain);
        this.inputGain.connect(this.wetGain);
      }
    } catch (e) {}
  }
}
