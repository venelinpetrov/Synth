import Oscillator from './Components/Osc.js'

  
var ctx = new AudioContext();
var vco = new Oscillator(ctx);
console.log(vco.getFrequency());
console.log(vco, 1);

