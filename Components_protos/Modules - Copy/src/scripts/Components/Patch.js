class Patch {
  constructor(){
    this._patch = {
      'Osc1_power': 'on',
      'Osc1_wave': 'square',
      'Osc1_pitch': 0,
      'Osc1_gain': .8
    }
  }

  setParameter(parameter, value) {
    this._patch[parameter] = value;
  }

  getParameter(parameter) {
    return this._patch[parameter];
  }
}
