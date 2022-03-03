import { html, css, LitElement, } from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { isNumber } from './validate';

@customElement('numeric-input')
export class NumericInput extends LitElement {
  @property()
  value : number = 0;
  @property()
  type : string = 'percent';
  @property()
  fieldid : string = 'percent';
  @property()
  min : number = 0;
  @property()
  max : number = 100;
  @property()
  symbol : string = '$';

  static styles = css`
    :host {
      --wc-error-bg-color: #000;
      --wc-error-border-color: transparent;
      --wc-error-border-width: 0;
      --wc-error-border-radius: 0.75rem;
      --wc-error-color: #fff;
      --wc-error-padding: 1rem;

      --wc-outline-color: #fff;
      --wc-outline-offset: 0.2rem;
      --wc-outline-style: dotted;
      --wc-outline-width: 0.25rem;

      --wc-btn-bg-color: rgb(0, 85, 34);
      --wc-btn-border-color: transparent;
      --wc-btn-border-width: 0;
      --wc-btn-border-radius: 0.75rem;
      --wc-btn-color: #fff;
      --wc-btn-font-family: inherit;
      --wc-btn-font-size: inherit;
      --wc-btn-padding: 0.2rem 0.75rem;

      --wc-input-bg-color: #000;
      --wc-input-border-color: #fff;
      --wc-input-border-style: solid;
      --wc-input-border-width: 0.075rem;
      --wc-input-border-radius: 0.75rem;
      --wc-input-color: #fff;
      --wc-input-error-color: #c00;
      --wc-input-font-family: 'Courier New', Courier, monospace;
      --wc-input-font-size: 1rem;
      --wc-input-padding-top: 0.1rem;
      --wc-input-padding-right: 0.5rem;
      --wc-input-padding-bottom: 0.1rem;
      --wc-input-padding-left: 0.5rem;
      --wc-input-width: 6rem;

      background-color: inherit
      color: inherit
      font-family: inherit
    }
    .wrap {
      background-color: var(--wc-input-bg-color);
      border: 0.05rem solid var(--wc-input-border-color);
      border-radius: var(--wc-input-border-radius);
      display: inline-flex;
      overflow: hidden;
      padding: var(--wc-input-padding-top)
               var(--wc-input-padding-right)
               var(--wc-input-padding-bottom)
               var(--wc-input-padding-left);
    }
    .wrap:focus-within {
      outline-color: var(--wc-outline-color);
      outline-offset: var(--wc-outline-offset);
      outline-style: var(--wc-outline-style);
      outline-width: var(--wc-outline-width);
    }
    .field__value {
      border: none;
      display: inline-block;
      font-family: var(--wc-input-font-family);
      font-size: var(--wc-input-font-size);
      width: var(--wc-input-width: 6rem);
      background-color: transparent;
      color: var(--wc-input-color);
      transform: translateY(0) !important;
    }
    .field__value:invalid {
      font-weight: bold;
      color: var(--wc-input-error-color);
    }
    .field__value--first {
      text-align: center;
    }
    .field__value--sm {
      width: 4.5rem !important;
    }
    .field__value:invalid + .field__unit--last {
      font-weight: bold;
      color: var(--wc-input-error-color);
    }
    .field__unit {
    }
    .field__unit--last {
      padding-left: 0.3rem;
    }
    .field__unit--first {
      padding-right: 0.2rem;
    }
  `;

  /**
   * The human readable value to be rendered
   *
   * @var humanValue
   */
  humanValue = 0;

  /**
   * Whether or not initialisation of functions and values is
   * alrady done
   *
   * @var initDone
   */
  initDone : boolean = false;

  /**
   * Numeric input step attribute value
   *
   * @var step
   */
  step : number = 0.0001;

  /**
   * Function used to convert human readable value into raw value to
   * be stored in the DB and used within the application
   *
   * @param {number} input
   * @returns {number}
   */
  getRaw : Function = (input : number) : number => { return input; };

  /**
   * Function to convert raw value (as stored in DB) to human
   * readable value
   *
   * @returns {void}
   */
  getHuman : Function = () : void => {  };

  /**
   * Regex pattern to be used as browser validation for user input
   *
   * (Derived from the set regex)
   *
   * @var pattern
   */
  pattern : string = '';

  /**
   * Pattern to validate user input
   *
   * @var regex
   */
  regex : RegExp = /^[0-9]{1,2}(?:\\.[0-9]{4})?$/;

  /**
   * Set the human readable dollar value for the input field
   *
   * @returns {void}
   */
  getHumanDollar () : void {
    this.humanValue = Math.round(this.value) / 100
  }

  /**
   * Set the human readable GST percent value for the input field
   *
   * @returns {void}
   */
  getHumanGst () {
    this.humanValue = ((Math.round((1 - (1 / this.value)) * 10000) / 100) * -1)
  }

  /**
   * Set the human readable percent value for the input field
   *
   * @returns {void}
   */
  getHumanPercent () : void {
    this.humanValue = Math.round((1 - this.value) * 10000) / 100
  }

  /**
   * Get the raw dollar value for the input field to be stored
   *
   * @returns {number}
   */
  getRawDollar (input : number) : number {
    return Math.round(input * 100)
  }

  /**
   * Get the raw GST value for the input field to be stored
   *
   * @returns {number}
   */
  getRawGst (input : number) : number {
    return (100 / (100 + input))
  }

  /**
   * Get the raw percent value for the input field to be stored
   *
   * @returns {number}
   */
  getRawPercent (input : number) : number {
    return (1 - (input / 100))
  }

  /**
   * Do all the work to initialise everything
   *
   * @returns {void}
   */
  doInit () {
    if (this.initDone === false) {
      this.initDone = true;
      if (!isNumber(this.min)) {
        console.error('Attribute "min" is not a number - (' + this.min + ')');
      }
      if (!isNumber(this.max)) {
        console.error('Attribute "max" is not a number - (' + this.max + ')');
      }
      switch (this.type) {
        case 'dollar':
        case 'dollars':
        case 'money':
          this.type = 'dollar';
          this.getHuman = this.getHumanDollar;
          this.getRaw = this.getRawDollar;
          this.regex = /^[0-9]+(?:\\.[0-9]{2})?$/;
          this.step = 0.01;
          break
        case 'discount':
        case 'gst':
          this.getHuman = this.getHumanGst;
          this.getRaw = this.getRawGst;
          break;

        case 'percent':
          this.getHuman = this.getHumanPercent;
          this.getRaw = this.getRawPercent;
          break;

        default:
          this.type = 'percent';
          this.getHuman = this.getHumanPercent;
          this.getRaw = this.getRawPercent;
          console.error('Could not determin appropriate type. Falling back to "percent"');
          break
      }
      this.pattern = this.regex.toString().replace(/^\/|\/$/g, '')
      this.getHuman()
    }
  }

  /**
   * Event handler function for change events
   *
   * @param event
   */
  valueChange (event: Event) : void {
    event.preventDefault()
    const input = event.target as HTMLInputElement;

    if (this.regex.test(input.value)) {
      this.humanValue = parseFloat(input.value);

      if (this.humanValue >= this.min && this.humanValue <= this.max) {
        const value = this.getRaw(this.humanValue)
        if (value !== this.value) {
          this.value = value;
          this.dispatchEvent(
            new Event('change', { bubbles: true, composed: true })
          )
        } else {
          console.info('Raw value is unchanged');
        }
      } else {
        console.error(input.value + ' is outside');
      }
    } else {
      console.error(input.value + ' is invalid');
    }
  }

  /**
   * Render the input field
   *
   * @returns {html}
   */
  render() {
    // console.group('render()')
    this.doInit();

    const modifier = (this.type !== 'dollar') ? ' field__value--first field__value--sm' : '';

    const input = html`<input type="number" id="${this.fieldid}" name="${this.fieldid}" class="field__value${modifier}" pattern="${this.pattern}" min="${this.min}" max="${this.max}" step="${this.step}" .value="${this.humanValue}" @change=${this.valueChange} />`;

    // console.log('this:', this)
    // console.log('this.fieldid:', this.fieldid)
    // console.log('modifier:', modifier)
    // console.log('input:', input)
    // console.groupEnd()
    if (this.type === 'dollar') {
      return html`
        <span class="wrap">
          <span class="field__unit field__unit--first">${this.symbol}</span>${input}
        </span>
      `;
    } else {
      return html`
        <span class="wrap">
          ${input}<span class="field__unit field__unit--last">%</span>
        </span>
      `;
    }
  }
}
