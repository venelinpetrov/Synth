/**
  ADSR Envelope class

  A: Attack
  D: Decay
  S: Sustain
  R: Release

  setValueAtTime(value, startTime)
  linearRampToValueAtTime(value, endTime)
  setTargetAtTime(target, startTime, timeConstant)
    -target parameter is the value the parameter will start changing to at the given time.

*/
class Envelope {
  constructor(ctx) {
    this.ctx = ctx;
  }


  //the method currently calculates the total time for which the note is not in sustain state
  //the release phase is independently set in Voice.stop()
  setADSR(audioParam, {attackTime = 0, decayTime = 0, sustainLevel = 1, releaseTime = 0}={}) {
    var now = this.ctx.currentTime;

    //audioParam.cancelScheduledValues(now);
    audioParam.setValueAtTime(0, now);
    //attack phase
    audioParam.linearRampToValueAtTime(audioParam.value, now + attackTime);
    //decay phase and sustain level
    audioParam.linearRampToValueAtTime(audioParam.value * sustainLevel, now + attackTime + decayTime);
    
    //release phase
    //the release phase is independently set in Voice.stop() via
    //oscillator.vca.gain.linearRampToValueAtTime(0,this.ctx.currentTime + this.endTime);

    return attackTime + decayTime + releaseTime;
  }

}
