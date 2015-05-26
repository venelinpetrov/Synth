'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

window.onload = function () {
  initSynth();
};

function initSynth() {
  var oscProto = Object.create(HTMLElement.prototype);

  oscProto.createdCallback = function () {
    var gainControl = HtmlControl.createSlider({
      id: this.id + '_gain',
      advanced: true,
      labelText: 'Amp: ',
      min: 0,
      max: 1,
      step: 0.1,
      value: 0.8,
      className: 'slider'
    });

    var waveTypeControl = HtmlControl.createSelect({
      id: this.id + '_wave',
      labelText: 'Wave Type: ',
      options: ['sine', 'square', 'triangle', 'sawtooth']
    });

    var pitchControl = HtmlControl.createNumericTextBox({
      id: this.id + '_pitch',
      labelText: 'Pitch: ',
      min: -64,
      max: 64,
      value: 0
    });

    var powerControl = HtmlControl.createCheckBox({
      id: this.id + '_power',
      labelText: 'On/Off: ',
      className: 'power'
    });

    //on/off
    this.appendChild(powerControl.label);
    this.appendChild(powerControl.input);

    //gain control
    gainControl.label.setAttribute('for', this.id + '_gain');
    this.appendChild(gainControl.label);
    this.appendChild(gainControl.slider);
    this.appendChild(gainControl.valueIndicator);

    //wave type control
    this.appendChild(waveTypeControl.label);
    this.appendChild(waveTypeControl.select);

    //pitch control
    this.appendChild(pitchControl.label);
    this.appendChild(pitchControl.input);
  };
  document.registerElement('x-osc', { prototype: oscProto });
}

var Oscillator = (function () {
  function Oscillator(wave, gain, pitch, ctx) {
    _classCallCheck(this, Oscillator);

    this.wave = wave;
    this.gain = gain;
    this.pitch = pitch;

    //create VCO (voltage controlled oscillator)
    this.vco = ctx.createOscillator();

    //create VCA (voltage controlled amplifier)
    this.vca = ctx.createGain();

    //vco->vca->destination
    this.vco.connect(this.vca);
    thic.vca.connect(ctx.destination);
  }

  _createClass(Oscillator, [{
    key: 'getType',

    //get/set wave type
    value: function getType() {
      return this.vco.type;
    }
  }, {
    key: 'setType',
    value: function setType(wave) {
      this.vco.type = wave;
    }
  }, {
    key: 'getGain',

    //get/set gain
    value: function getGain() {
      return this.vca.gain.value;
    }
  }, {
    key: 'setGain',
    value: function setGain(value) {
      this.vca.gain.value = value;
    }
  }, {
    key: 'getPitch',

    //get/set pitch
    value: function getPitch() {
      return this.vco.detune.value;
    }
  }, {
    key: 'setPitch',
    value: function setPitch(value) {
      this.vco.detune.value = value;
    }
  }, {
    key: 'getFrequency',

    //get/set frequency
    value: function getFrequency() {
      return this.vco.frequency.value;
    }
  }, {
    key: 'setFrequency',
    value: function setFrequency(value) {
      this.vco.frequency.value = value;
    }
  }, {
    key: 'connect',

    //connect vca->external_node
    value: function connect(node) {
      this.vca.connect(node);
    }
  }, {
    key: 'start',

    //start/stop
    value: function start() {
      var time = arguments[0] === undefined ? 0 : arguments[0];

      this.vco.start(time);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var time = arguments[0] === undefined ? 0 : arguments[0];

      this.vco.stop(time);
    }
  }]);

  return Oscillator;
})();

var HtmlControl = (function () {
  function HtmlControl() {
    _classCallCheck(this, HtmlControl);
  }

  _createClass(HtmlControl, null, [{
    key: 'createSlider',

    //Slider control
    value: function createSlider() {
      var _ref = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref.id;
      var _ref$className = _ref.className;
      var className = _ref$className === undefined ? '' : _ref$className;
      var labelText = _ref.labelText;
      var min = _ref.min;
      var max = _ref.max;
      var step = _ref.step;
      var value = _ref.value;
      var _ref$advanced = _ref.advanced;
      var advanced = _ref$advanced === undefined ? false : _ref$advanced;

      var valueIndicator;
      var label;
      var slider = document.createElement('input');

      //simple slider
      slider.setAttribute('type', 'range');
      //slider.id = id;
      slider.className = 'parameter' + ' ' + className;
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;

      //advanced slider
      if (advanced) {
        //create html elements
        label = document.createElement('label');
        valueIndicator = document.createElement('input');
        valueIndicator.className = 'parameter';

        //label
        label.textContent = labelText;

        //value indicator
        valueIndicator.id = id;
        valueIndicator.setAttribute('type', 'number');
        valueIndicator.min = min;
        valueIndicator.max = max;
        valueIndicator.value = value;
        valueIndicator.step = step;
        valueIndicator.addEventListener('input', function (e) {
          slider.value = e.target.value;
        }, false);

        //slider
        slider.classList.remove('parameter');
        slider.addEventListener('input', function (e) {
          valueIndicator.value = e.target.value;
        }, false);

        return { slider: slider, label: label, valueIndicator: valueIndicator };
      }

      return { slider: slider };
    }
  }, {
    key: 'createSelect',
    value: function createSelect() {
      var _ref2 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref2.id;
      var labelText = _ref2.labelText;
      var _ref2$options = _ref2.options;
      var options = _ref2$options === undefined ? [] : _ref2$options;

      var select = document.createElement('select');
      var label = document.createElement('label');
      select.id = id;
      select.className = 'parameter';
      label.setAttribute('for', id);
      label.textContent = labelText;
      for (var i = 0; i < options.length; i++) {
        var option = select.appendChild(document.createElement('option'));
        option.value = options[i];
        option.innerHTML = options[i];
      }

      return { select: select, label: label };
    }
  }, {
    key: 'createNumericTextBox',
    value: function createNumericTextBox() {
      var _ref3 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref3.id;
      var labelText = _ref3.labelText;
      var _ref3$min = _ref3.min;
      var min = _ref3$min === undefined ? 0 : _ref3$min;
      var _ref3$max = _ref3.max;
      var max = _ref3$max === undefined ? 1 : _ref3$max;
      var _ref3$value = _ref3.value;
      var value = _ref3$value === undefined ? 1 : _ref3$value;

      var input = document.createElement('input');
      var label = document.createElement('label');
      input.id = id;
      input.className = 'parameter';
      input.setAttribute('type', 'number');
      input.min = min;
      input.max = max;
      input.value = value;
      label.setAttribute('for', id);
      label.textContent = labelText;

      return { input: input, label: label };
    }
  }, {
    key: 'createCheckBox',
    value: function createCheckBox() {
      var _ref4 = arguments[0] === undefined ? {} : arguments[0];

      var id = _ref4.id;
      var labelText = _ref4.labelText;
      var className = _ref4.className;

      var input = document.createElement('input');
      var label = document.createElement('label');

      input.id = id;
      input.className = className;
      input.setAttribute('type', 'checkbox');

      label.setAttribute('for', id);
      label.innerHTML = labelText;

      return { input: input, label: label };
    }
  }]);

  return HtmlControl;
})();

//# sourceMappingURL=data:application/json;base64,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Ozs7U0FuR0csV0FBVyIsImZpbGUiOiJvc2MtY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgaW5pdFN5bnRoKCk7XG59O1xuXG5mdW5jdGlvbiBpbml0U3ludGgoKSB7XG4gIHZhciBvc2NQcm90byA9IE9iamVjdC5jcmVhdGUoSFRNTEVsZW1lbnQucHJvdG90eXBlKTtcblxuICBvc2NQcm90by5jcmVhdGVkQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZ2FpbkNvbnRyb2wgPSBIdG1sQ29udHJvbC5jcmVhdGVTbGlkZXIoe1xuICAgICAgaWQ6IHRoaXMuaWQgKyAnX2dhaW4nLFxuICAgICAgYWR2YW5jZWQ6IHRydWUsXG4gICAgICBsYWJlbFRleHQ6ICdBbXA6ICcsXG4gICAgICBtaW46IDAsXG4gICAgICBtYXg6IDEsXG4gICAgICBzdGVwOiAwLjEsXG4gICAgICB2YWx1ZTogMC44LFxuICAgICAgY2xhc3NOYW1lOiAnc2xpZGVyJ1xuICAgIH0pO1xuXG4gICAgdmFyIHdhdmVUeXBlQ29udHJvbCA9IEh0bWxDb250cm9sLmNyZWF0ZVNlbGVjdCh7XG4gICAgICBpZDogdGhpcy5pZCArICdfd2F2ZScsXG4gICAgICBsYWJlbFRleHQ6ICdXYXZlIFR5cGU6ICcsXG4gICAgICBvcHRpb25zOiBbJ3NpbmUnLCAnc3F1YXJlJywgJ3RyaWFuZ2xlJywgJ3Nhd3Rvb3RoJ11cbiAgICB9KTtcblxuICAgIHZhciBwaXRjaENvbnRyb2wgPSBIdG1sQ29udHJvbC5jcmVhdGVOdW1lcmljVGV4dEJveCh7XG4gICAgICAgIGlkOiB0aGlzLmlkICsgJ19waXRjaCcsXG4gICAgICAgIGxhYmVsVGV4dDogJ1BpdGNoOiAnLFxuICAgICAgICBtaW46IC02NCxcbiAgICAgICAgbWF4OiA2NCxcbiAgICAgICAgdmFsdWU6IDBcbiAgICB9KTtcblxuICAgIHZhciBwb3dlckNvbnRyb2wgPSBIdG1sQ29udHJvbC5jcmVhdGVDaGVja0JveCh7XG4gICAgICBpZDogdGhpcy5pZCArICdfcG93ZXInLFxuICAgICAgbGFiZWxUZXh0OiAnT24vT2ZmOiAnLFxuICAgICAgY2xhc3NOYW1lOiAncG93ZXInXG4gICAgfSk7XG5cbiAgICAvL29uL29mZlxuICAgIHRoaXMuYXBwZW5kQ2hpbGQocG93ZXJDb250cm9sLmxhYmVsKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKHBvd2VyQ29udHJvbC5pbnB1dCk7XG5cbiAgICAvL2dhaW4gY29udHJvbFxuICAgIGdhaW5Db250cm9sLmxhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgdGhpcy5pZCArICdfZ2FpbicpO1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQoZ2FpbkNvbnRyb2wubGFiZWwpO1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQoZ2FpbkNvbnRyb2wuc2xpZGVyKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKGdhaW5Db250cm9sLnZhbHVlSW5kaWNhdG9yKTtcblxuICAgIC8vd2F2ZSB0eXBlIGNvbnRyb2xcbiAgICB0aGlzLmFwcGVuZENoaWxkKHdhdmVUeXBlQ29udHJvbC5sYWJlbCk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZCh3YXZlVHlwZUNvbnRyb2wuc2VsZWN0KTtcblxuICAgIC8vcGl0Y2ggY29udHJvbFxuICAgIHRoaXMuYXBwZW5kQ2hpbGQocGl0Y2hDb250cm9sLmxhYmVsKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKHBpdGNoQ29udHJvbC5pbnB1dClcbiAgfTtcbiAgZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCd4LW9zYycsIHtwcm90b3R5cGU6IG9zY1Byb3RvfSk7XG59XG5cblxuY2xhc3MgT3NjaWxsYXRvciB7XG4gIGNvbnN0cnVjdG9yKHdhdmUsIGdhaW4sIHBpdGNoLCBjdHgpIHtcbiAgICB0aGlzLndhdmUgPSB3YXZlO1xuICAgIHRoaXMuZ2FpbiA9IGdhaW47XG4gICAgdGhpcy5waXRjaCA9IHBpdGNoO1xuXG4gICAgLy9jcmVhdGUgVkNPICh2b2x0YWdlIGNvbnRyb2xsZWQgb3NjaWxsYXRvcilcbiAgICB0aGlzLnZjbyA9IGN0eC5jcmVhdGVPc2NpbGxhdG9yKCk7XG5cbiAgICAvL2NyZWF0ZSBWQ0EgKHZvbHRhZ2UgY29udHJvbGxlZCBhbXBsaWZpZXIpXG4gICAgdGhpcy52Y2EgPSBjdHguY3JlYXRlR2FpbigpO1xuXG4gICAgLy92Y28tPnZjYS0+ZGVzdGluYXRpb25cbiAgICB0aGlzLnZjby5jb25uZWN0KHRoaXMudmNhKTtcbiAgICB0aGljLnZjYS5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XG4gIH1cblxuICAvL2dldC9zZXQgd2F2ZSB0eXBlXG4gIGdldFR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudmNvLnR5cGU7XG4gIH1cbiAgc2V0VHlwZSh3YXZlKSB7XG4gICAgdGhpcy52Y28udHlwZSA9IHdhdmU7XG4gIH1cblxuICAvL2dldC9zZXQgZ2FpblxuICBnZXRHYWluKCkge1xuICAgIHJldHVybiB0aGlzLnZjYS5nYWluLnZhbHVlO1xuICB9XG4gIHNldEdhaW4odmFsdWUpIHtcbiAgICB0aGlzLnZjYS5nYWluLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvL2dldC9zZXQgcGl0Y2hcbiAgZ2V0UGl0Y2goKSB7XG4gICAgcmV0dXJuIHRoaXMudmNvLmRldHVuZS52YWx1ZTtcbiAgfVxuICBzZXRQaXRjaCh2YWx1ZSkge1xuICAgIHRoaXMudmNvLmRldHVuZS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLy9nZXQvc2V0IGZyZXF1ZW5jeVxuICBnZXRGcmVxdWVuY3koKSB7XG4gICAgcmV0dXJuIHRoaXMudmNvLmZyZXF1ZW5jeS52YWx1ZTtcbiAgfVxuICBzZXRGcmVxdWVuY3kodmFsdWUpIHtcbiAgICB0aGlzLnZjby5mcmVxdWVuY3kudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8vY29ubmVjdCB2Y2EtPmV4dGVybmFsX25vZGVcbiAgY29ubmVjdChub2RlKSB7XG4gICAgdGhpcy52Y2EuY29ubmVjdChub2RlKTtcbiAgfVxuXG4gIC8vc3RhcnQvc3RvcFxuICBzdGFydCh0aW1lPTApIHtcbiAgICB0aGlzLnZjby5zdGFydCh0aW1lKTtcbiAgfVxuICBzdG9wKHRpbWU9MCkge1xuICAgIHRoaXMudmNvLnN0b3AodGltZSk7XG4gIH1cbn1cblxuY2xhc3MgSHRtbENvbnRyb2wge1xuICAvL1NsaWRlciBjb250cm9sXG4gIHN0YXRpYyBjcmVhdGVTbGlkZXIoe2lkLCBjbGFzc05hbWU9JycsIGxhYmVsVGV4dCwgbWluLCBtYXgsIHN0ZXAsIHZhbHVlLCBhZHZhbmNlZD1mYWxzZX0gPSB7fSkge1xuICAgIHZhciB2YWx1ZUluZGljYXRvcjtcbiAgICB2YXIgbGFiZWw7XG4gICAgdmFyIHNsaWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cblxuICAgIC8vc2ltcGxlIHNsaWRlclxuICAgIHNsaWRlci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAncmFuZ2UnKTtcbiAgICAvL3NsaWRlci5pZCA9IGlkO1xuICAgIHNsaWRlci5jbGFzc05hbWUgPSAncGFyYW1ldGVyJyArICcgJyArIGNsYXNzTmFtZTtcbiAgICBzbGlkZXIubWluID0gbWluO1xuICAgIHNsaWRlci5tYXggPSBtYXg7XG4gICAgc2xpZGVyLnN0ZXAgPSBzdGVwO1xuICAgIHNsaWRlci52YWx1ZSA9IHZhbHVlO1xuXG5cbiAgICAvL2FkdmFuY2VkIHNsaWRlclxuICAgIGlmKGFkdmFuY2VkKSB7XG4gICAgICAvL2NyZWF0ZSBodG1sIGVsZW1lbnRzXG4gICAgICBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICB2YWx1ZUluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICB2YWx1ZUluZGljYXRvci5jbGFzc05hbWUgPSAncGFyYW1ldGVyJztcblxuICAgICAgLy9sYWJlbFxuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBsYWJlbFRleHQ7XG5cblxuICAgICAgLy92YWx1ZSBpbmRpY2F0b3JcbiAgICAgIHZhbHVlSW5kaWNhdG9yLmlkID0gaWQ7XG4gICAgICB2YWx1ZUluZGljYXRvci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnbnVtYmVyJyk7XG4gICAgICB2YWx1ZUluZGljYXRvci5taW4gPSBtaW47XG4gICAgICB2YWx1ZUluZGljYXRvci5tYXggPSBtYXg7XG4gICAgICB2YWx1ZUluZGljYXRvci52YWx1ZSA9IHZhbHVlO1xuICAgICAgdmFsdWVJbmRpY2F0b3Iuc3RlcCA9IHN0ZXA7XG4gICAgICB2YWx1ZUluZGljYXRvci5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHNsaWRlci52YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgfSwgZmFsc2UpO1xuXG5cbiAgICAgIC8vc2xpZGVyXG4gICAgICBzbGlkZXIuY2xhc3NMaXN0LnJlbW92ZSgncGFyYW1ldGVyJyk7XG4gICAgICBzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSk9PntcbiAgICAgICAgdmFsdWVJbmRpY2F0b3IudmFsdWUgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgcmV0dXJuIHtzbGlkZXIsIGxhYmVsLCB2YWx1ZUluZGljYXRvcn07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtzbGlkZXJ9O1xuICB9XG5cblxuICBzdGF0aWMgY3JlYXRlU2VsZWN0KHtpZCwgbGFiZWxUZXh0LCBvcHRpb25zPVtdfSA9IHt9KSB7XG4gICAgdmFyIHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpO1xuICAgIHZhciBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgc2VsZWN0LmlkID0gaWQ7XG4gICAgc2VsZWN0LmNsYXNzTmFtZSA9ICdwYXJhbWV0ZXInO1xuICAgIGxhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgaWQpO1xuICAgIGxhYmVsLnRleHRDb250ZW50ID0gbGFiZWxUZXh0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG9wdGlvbiA9IHNlbGVjdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKSk7XG4gICAgICBvcHRpb24udmFsdWUgPSBvcHRpb25zW2ldO1xuICAgICAgb3B0aW9uLmlubmVySFRNTCA9IG9wdGlvbnNbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtzZWxlY3QsIGxhYmVsfTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVOdW1lcmljVGV4dEJveCh7aWQsIGxhYmVsVGV4dCwgbWluID0gMCwgbWF4ID0gMSwgdmFsdWUgPSAxfSA9IHt9KSB7XG4gICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGlucHV0LmlkID0gaWQ7XG4gICAgaW5wdXQuY2xhc3NOYW1lID0gJ3BhcmFtZXRlcic7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ251bWJlcicpO1xuICAgIGlucHV0Lm1pbiA9IG1pbjtcbiAgICBpbnB1dC5tYXggPSBtYXg7XG4gICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsIGlkKTtcbiAgICBsYWJlbC50ZXh0Q29udGVudCA9IGxhYmVsVGV4dDtcblxuICAgIHJldHVybiB7aW5wdXQsIGxhYmVsfTtcbiAgfVxuXG5cbiAgc3RhdGljIGNyZWF0ZUNoZWNrQm94KHtpZCwgbGFiZWxUZXh0LCBjbGFzc05hbWV9ID0ge30pIHtcbiAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHZhciBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG5cbiAgICBpbnB1dC5pZCA9IGlkO1xuICAgIGlucHV0LmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnY2hlY2tib3gnKTtcblxuICAgIGxhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgaWQpO1xuICAgIGxhYmVsLmlubmVySFRNTCA9IGxhYmVsVGV4dDtcblxuICAgIHJldHVybiB7aW5wdXQsIGxhYmVsfTtcblxuICB9XG59XG4iXX0=