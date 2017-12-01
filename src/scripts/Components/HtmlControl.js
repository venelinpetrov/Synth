class HtmlControl {
  //Slider control
  static createSlider({id, className='', labelText, min, max, step, value, advanced=false} = {}) {
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
    if(!advanced) {
      slider.id = id;
    }

    //advanced slider
    if(advanced) {
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
      valueIndicator.addEventListener('input', (e) => {
        slider.value = e.target.value;
      }, false);


      //slider
      slider.classList.remove('parameter');
      slider.addEventListener('input', (e)=>{
        valueIndicator.value = e.target.value;
        valueIndicator.dispatchEvent(new MouseEvent('input'));
      }, false);

      return {slider, label, valueIndicator};
    }

    return {slider};
  }


  static createSelect({id, labelText, options=[]} = {}) {
    var select = document.createElement('select');
    var label = document.createElement('label');
    select.id = id;
    select.className = 'parameter';
    label.setAttribute('for', id);
    label.textContent = labelText;
    for (let i = 0; i < options.length; i++) {
      let option = select.appendChild(document.createElement('option'));
      option.value = options[i];
      option.innerHTML = options[i];
    }

    return {select, label};
  }

  static createNumericTextBox({id, labelText, min = 0, max = 1, step=1, value = 1} = {}) {
    var input = document.createElement('input');
    var label = document.createElement('label');
    input.id = id;
    input.className = 'parameter';
    input.setAttribute('type', 'number');
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    label.setAttribute('for', id);
    label.textContent = labelText;

    return {input, label};
  }


  static createCheckBox({id, labelText, className} = {}) {

    var input = document.createElement('input');
    var label = document.createElement('label');

    input.id = id;
    input.className = className;
    input.setAttribute('type', 'checkbox');

    label.setAttribute('for', id);
    label.innerHTML = labelText;

    return {input, label};

  }

  static createOnOfSwitch(id) {
    var wrapper = document.createElement('div');
    var input = document.createElement('input');
    var label = document.createElement('label');
    var inner = document.createElement('span');
    var switchBtn = document.createElement('span');

    //wrapper
    wrapper.className = 'onoffswitch';

    //input
    input.id = id;
    input.setAttribute('type', 'checkbox');
    input.className = 'power onoffswitch-checkbox';

    //label
    label.className = 'onoffswitch-label';
    label.setAttribute('for', id);

    //inside label
    inner.className = 'onoffswitch-inner';
    switchBtn.className = 'onoffswitch-switch';

    //structure
    wrapper.appendChild(input);
    wrapper.appendChild(label);
    label.appendChild(inner);
    label.appendChild(switchBtn);

    return {wrapper, input};
  }
}
