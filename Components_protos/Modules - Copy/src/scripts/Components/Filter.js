/**
  Filter class

  Filter types

    - lowpass (12dB/octave)  ---\
      @ frequency - the cutoff frequency [HZ]
      @ Q - the resonance [dB]

    - highpass (12dB/octave)  /---
      @ frequency - the cutoff frequency [HZ]
      @ Q - the resonance [dB]

    - bandpass (12dB/octave each side)  __/--\__
      @ frequency - the center frequency [HZ]
      @ Q - Controls the width of the band. The width becomes narrower as the Q value increases [.2 to 30]

    - lowshelf  --\__
      @ frequnecy - the upper limit of the frequences where the boost (or attenuation) is applied. [Hz]
      @ gain - the boost (+/-) [dB]

    - highshelf  __/--
      @ frequnecy - the lower limit of the frequences where the boost (or attenuation) is applied. [Hz]
      @ gain - the boost (+/-) [dB]

    - peaking  __/\__
      @ frequency - the center frequency of where the boost is applied [Hz]
      @ Q - Controls the width of the band of frequencies that are boosted. A large value implies a narrow width [0.0001 to 1000]
      @ gain - the boost (+/-) [dB]

    - notch  --\/--
      @ frequency - the center frequency of where the notch is applied

*/
class Filter {

}
