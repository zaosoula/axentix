/**
 * Class Caroulix
 * @class
 */
class Caroulix {
  /**
   * Construct Caroulix instance
   * @constructor
   * @param {String} element
   * @param {Object} options
   */
  constructor(element, options) {
    this.defaultOptions = {
      fixedHeight: true,
      height: '',
      animationDelay: 500,
      animationType: 'slide',
      indicators: false,
      isIndicatorFlat: false,
      autoplay: true,
      autoInterval: 3000
    };

    this.el = document.querySelector(element);

    this.options = Axentix.extend(this.defaultOptions, options);
    this._setup();
  }

  _setup() {
    const animationList = ['slide'];
    animationList.includes(this.options.animationType) ? '' : (this.options.animationType = 'slide');
    this.currentItemIndex = 0;
    this.isAnimated = false;
    this._getChildrens();
    this.options.indicators ? this._enableIndicators() : '';
    this._getActiveElementIndex();
    this._setupListeners();

    this.el.classList.add('anim-' + this.options.animationType);

    this.updateHeight();
  }

  /**
   * Setup listeners
   */
  _setupListeners() {
    this.windowResizeRef = this._setMaxHeight.bind(this);
    window.addEventListener('resize', this.windowResizeRef);

    if (this.arrowPrev && this.arrowNext) {
      this.arrowPrevRef = this.prev.bind(this, 1);
      this.arrowNextRef = this.next.bind(this, 1);

      this.arrowPrev.addEventListener('click', this.arrowPrevRef);
      this.arrowNext.addEventListener('click', this.arrowNextRef);
    }
  }

  /**
   * Remove listeners
   */
  _removeListeners() {
    window.removeEventListener('resize', this.windowResizeRef);
    this.windowResizeRef = undefined;

    if (this.arrowPrev && this.arrowNext) {
      this.arrowPrev.removeEventListener('click', this.arrowPrevRef);
      this.arrowNext.removeEventListener('click', this.arrowNextRef);
      this.arrowPrevRef = undefined;
      this.arrowNextRef = undefined;
    }
  }

  /**
   * Get caroulix childrens
   */
  _getChildrens() {
    this.childrens = Array.from(this.el.children).reduce((acc, child) => {
      child.classList.contains('caroulix-item') ? acc.push(child) : '';

      child.classList.contains('caroulix-prev') ? (this.arrowPrev = child) : '';
      child.classList.contains('caroulix-next') ? (this.arrowNext = child) : '';
      return acc;
    }, []);
  }

  _getActiveElementIndex() {
    this.childrens.map((child, i) => {
      if (child.classList.contains('active')) {
        this.currentItemIndex = i;
      }
    });

    const item = this.childrens[this.currentItemIndex];
    item.classList.contains('active') ? '' : item.classList.add('active');
    this.options.indicators ? this.indicators.children[this.currentItemIndex].classList.add('active') : '';

    this._waitUntilLoad(item);
  }

  _waitUntilLoad(item) {
    if (this.options.fixedHeight) {
      this.totalLoadChild = 0;
      this.totalLoadedChild = 0;
      this.childrens.map(child => {
        const waitItem = child.querySelector('img') || child.querySelector('video');
        if (waitItem) {
          waitItem.loadRef = this._initWhenLoaded.bind(this, waitItem);
          waitItem.addEventListener('load', waitItem.loadRef);
          this.totalLoadChild++;
        }
      });
    } else {
      const childItem = item.querySelector('img') || item.querySelector('video');
      if (childItem) {
        childItem.loadRef = this._initWhenLoaded.bind(this, childItem);
        childItem.addEventListener('load', childItem.loadRef);
      }
    }
  }

  /**
   * Update height & remove listener when active element is loaded
   * @param {Element} item
   */
  _initWhenLoaded(item) {
    if (this.options.fixedHeight) {
      item.removeEventListener('load', item.loadRef);
      item.loadRef = undefined;
      this.totalLoadedChild++;

      if (this.totalLoadedChild === this.totalLoadChild) {
        this.updateHeight('', true);
        this.totalLoadedChild = undefined;
        this.totalLoadChild = undefined;
      }
    } else {
      this.updateHeight('', true);
      item.removeEventListener('load', item.loadRef);
      item.loadRef = undefined;
    }
  }

  _setMaxHeight() {
    const childrensHeight = this.childrens.map(child => {
      return child.offsetHeight;
    });
    this.maxHeight = Math.max(...childrensHeight);

    this.el.style.height = this.maxHeight + 'px';
  }

  /**
   * Dynamic height option
   * @param {string} side
   */
  _setDynamicHeight(side, init) {
    let index;
    init
      ? (index = this.currentItemIndex)
      : side === 'right'
      ? (index = this._getNextItemIndex(1))
      : (index = this._getPreviousItemIndex(1));
    const height = this.childrens[index].offsetHeight;
    this.el.style.height = height + 'px';
  }

  /**
   * Enable indicators
   */
  _enableIndicators() {
    this.indicators = document.createElement('ul');
    this.indicators.classList.add('caroulix-indicators');
    this.options.isIndicatorFlat ? this.indicators.classList.add('caroulix-flat') : '';

    for (let i = 0; i < this.childrens.length; i++) {
      const li = document.createElement('li');
      li.triggerRef = this._handleIndicatorClick.bind(this, i);
      li.addEventListener('click', li.triggerRef);
      this.indicators.appendChild(li);
    }
    this.el.appendChild(this.indicators);
  }

  /***** Animation Section *****/

  /**
   * Slide animation
   * @param {number} number
   * @param {string} side
   */
  _animationSlide(number, side) {
    const nextItem = this.childrens[number];
    const currentItem = this.childrens[this.currentItemIndex];
    let nextItemPercentage = '',
      currentItemPercentage = '';

    if (side === 'right') {
      nextItemPercentage = '100%';
      currentItemPercentage = '-100%';
    } else {
      nextItemPercentage = '-100%';
      currentItemPercentage = '100%';
    }

    nextItem.style.transform = `translateX(${nextItemPercentage})`;
    nextItem.classList.add('active');

    setTimeout(() => {
      nextItem.style.transitionDuration = this.options.animationDelay + 'ms';
      nextItem.style.transform = '';
      currentItem.style.transitionDuration = this.options.animationDelay + 'ms';
      currentItem.style.transform = `translateX(${currentItemPercentage})`;
    }, 50);

    setTimeout(() => {
      nextItem.removeAttribute('style');
      currentItem.classList.remove('active');
      currentItem.removeAttribute('style');

      this.currentItemIndex = number;
      this.isAnimated = false;
    }, this.options.animationDelay + 50);
  }

  /***** [END] Animation Section [END] *****/

  /**
   * Handle indicator click
   * @param {number} i
   * @param {Event} e
   */
  _handleIndicatorClick(i, e) {
    e.preventDefault();

    if (i === this.currentItemIndex) {
      return;
    }

    let side = '';
    i > this.currentItemIndex ? (side = 'right') : (side = 'left');
    this.goTo(i, side);
  }

  _getPreviousItemIndex(step) {
    let previousItemIndex = 0;
    let index = this.currentItemIndex;
    for (let i = 0; i < step; i++) {
      if (index > 0) {
        previousItemIndex = index - 1;
        index--;
      } else {
        index = this.childrens.length - 1;
        previousItemIndex = index;
      }
    }
    return previousItemIndex;
  }

  _getNextItemIndex(step) {
    let nextItemIndex = 0;
    let index = this.currentItemIndex;
    for (let i = 0; i < step; i++) {
      if (index < this.childrens.length - 1) {
        nextItemIndex = index + 1;
        index++;
      } else {
        index = 0;
        nextItemIndex = index;
      }
    }
    return nextItemIndex;
  }

  /**
   * Update height of caroulix container
   */
  updateHeight(side, init) {
    if (this.options.fixedHeight) {
      this._setMaxHeight();
      return;
    }
    this._setDynamicHeight(side, init);
  }

  /**
   * Go to {n} item
   * @param {number} number
   * @param {string} side
   */
  goTo(number, side) {
    if (this.isAnimated) {
      return;
    }

    this.isAnimated = true;
    const animFunction =
      '_animation' +
      this.options.animationType.charAt(0).toUpperCase() +
      this.options.animationType.substring(1);

    if (this.options.indicators) {
      Array.from(this.indicators.children).map(li => {
        li.removeAttribute('class');
      });
      this.indicators.children[number].classList.add('active');
    }

    this.options.fixedHeight ? '' : this.updateHeight(side);
    this[animFunction](number, side);
  }

  prev(step, e) {
    if (this.isAnimated) {
      return;
    }

    const previousItemIndex = this._getPreviousItemIndex(step);
    this.goTo(previousItemIndex, 'left');
  }

  next(step, e) {
    if (this.isAnimated) {
      return;
    }

    const nextItemIndex = this._getNextItemIndex(step);
    this.goTo(nextItemIndex, 'right');
  }
}
