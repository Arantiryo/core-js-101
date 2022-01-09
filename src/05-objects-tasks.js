/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = Object.create(proto);
  Object.assign(obj, JSON.parse(json));
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class BaseSelector {
  constructor(value, type) {
    this.selectors = [];
    this.selectorTypes = [];
    this.addSelector(value, type);
  }

  addSelector(value, type) {
    this.selectors.push(value);
    this.selectorTypes.push(type);
    if (!this.checkUniqueSelectors()) {
      // prettier-ignore
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (!this.checkOrder()) {
      // prettier-ignore
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
  }

  element(value) {
    this.addSelector(value, 'elem');
    return this;
  }

  id(value) {
    this.addSelector(`#${value}`, '#');
    return this;
  }

  class(value) {
    this.addSelector(`.${value}`, '.');
    return this;
  }

  attr(value) {
    this.addSelector(`[${value}]`, 'attr');
    return this;
  }

  pseudoClass(value) {
    this.addSelector(`:${value}`, ':');
    return this;
  }

  pseudoElement(value) {
    this.addSelector(`::${value}`, '::');
    return this;
  }

  combine(combinator, selector2) {
    this.selectors.push(` ${combinator} `, ...selector2.selectors);
    return this;
  }

  stringify() {
    return this.selectors.join('');
  }

  checkUniqueSelectors() {
    if (this.selectorTypes.length < 2) return true;
    // prettier-ignore
    if (this.selectorTypes.filter((x) => x === 'elem').length > 1
      || this.selectorTypes.filter((x) => x === '#').length > 1
      || this.selectorTypes.filter((x) => x === '::').length > 1) {
      return false;
    }
    return true;
  }

  checkOrder() {
    const POSITIONS = {
      elem: 1,
      '#': 2,
      '.': 3,
      attr: 4,
      ':': 5,
      '::': 6,
    };

    // prettier-ignore
    const ordered = [...this.selectorTypes].sort((a, b) => POSITIONS[a] - POSITIONS[b]);
    return this.selectorTypes.every((v, i) => v === ordered[i]);
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new BaseSelector(value, 'elem');
  },

  id(value) {
    return new BaseSelector(`#${value}`, '#');
  },

  class(value) {
    return new BaseSelector(`.${value}`, '.');
  },

  attr(value) {
    return new BaseSelector(`[${value}]`, 'attr');
  },

  pseudoClass(value) {
    return new BaseSelector(`:${value}`, ':');
  },

  pseudoElement(value) {
    return new BaseSelector(`::${value}`, '::');
  },

  combine(selector1, combinator, selector2) {
    return selector1.combine(combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
