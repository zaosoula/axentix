(() => {
  /**
   * Class lightbox
   * @class
   */

  class Lightbox extends AxentixComponent {
    static getDefaultOptions() {
      return {
        overlay: true,
        overlayColor: 'grey dark-4',
        caption: '',
        //   bodyScrolling: false,
        animationDuration: 400,
      };
    }

    /**
     * Construct Lightbox instance
     * @constructor
     * @param {String} element
     * @param {Object} options
     */
    constructor(element, options, isLoadedWithData) {
      super();

      Axentix.instances.push({ type: 'Lightbox', instance: this });

      this.el = document.querySelector(element);

      this.options = Axentix.getComponentOptions('Lightbox', options, this.el, isLoadedWithData);

      this._setup();
    }

    /**
     * Setup component
     */
    _setup() {
      Axentix.createEvent(this.el, 'lightbox.setup');
      this.el.style.transitionDuration = this.options.animationDuration + 'ms';

      this.container = Axentix.wrap([this.el]);

      this._setupListeners();
    }

    /**
     * Setup listeners
     */
    _setupListeners() {
      this.openOnClickRef = this._setActiveLightbox.bind(this);
      this.el.addEventListener('click', this.openOnClickRef);

      this.onResizeRef = this._updatePosition.bind(this);
      window.addEventListener('resize', this.onResizeRef);

      this.closeEventRef = this._unsetActiveLightbox.bind(this);
      window.addEventListener('keyup', this.closeEventRef);
      window.addEventListener('scroll', this.closeEventRef);
      window.addEventListener('resize', this.closeEventRef);
    }

    /**
     * Remove event listeners
     */
    _removeListeners() {
      window.removeEventListener('keyup', this.closeEventRef);
      window.removeEventListener('scroll', this.closeEventRef);
      window.removeEventListener('resize', this.closeEventRef);
    }

    /**
     * Set position of active lightbox
     */
    _setActiveLightbox() {
      if (this.isActive) {
        this._unsetActiveLightbox();
        return;
      }

      const rect = this.el.getBoundingClientRect();
      this.el.style.top = this.top = rect.top;
      this.el.style.left = this.left = rect.left;

      this.el.width = this.basicWidth = rect.width;
      this.el.height = this.basicHeight = rect.height;

      const centerTop = window.innerHeight / 2;
      const centerLeft = window.innerWidth / 2;

      this._calculateRatio();

      this.container.style.position = 'relative';
      this._setOverlay();

      setTimeout(() => {
        this.el.classList.add('active');
        this.isActive = true;
        this._showOverlay();
        this.container.style.width = this.basicWidth;
        this.container.style.height = this.basicHeight;

        this.el.width = this.newWidth;
        this.el.height = this.newHeight;
        this.el.style.top = centerTop + 'px';
        this.el.style.left = centerLeft + 'px';

        // this.el.style.height =
      }, 50);
    }

    /**
     * Unset active lightbox
     */
    _unsetActiveLightbox() {
      if (!this.isActive) {
        return;
      }
      this.el.style.top = this.top;
      this.el.style.left = this.left;
      this.el.style.transform = 'translate(0)';

      this.el.width = this.basicWidth;
      this.el.height = this.basicHeight;
      this._unsetOverlay();

      setTimeout(() => {
        this.el.classList.remove('active');
        this.isActive = false;
        this.container.style.width = '';
        this.container.style.height = '';
        this.el.style.left = '';
        this.el.style.top = '';
        this.el.style.transform = '';
      }, this.options.animationDuration);
    }

    /**
     * Reset basic position on resize event
     */
    _updatePosition() {
      const rect = this.el.getBoundingClientRect();
      this.el.style.top = this.top = rect.top;
      this.el.style.left = this.left = rect.left;
    }

    _setOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.style.transitionDuration = this.options.animationDuration + 'ms';
      this.overlay.className = 'lightbox-overlay ' + this.options.overlayColor;
      this.container.appendChild(this.overlay);
    }

    _showOverlay() {
      this.overlay.style.opacity = 1;
    }

    _unsetOverlay() {
      this.overlay.style.opacity = 0;

      setTimeout(() => {
        this.overlay.remove();
      }, this.options.animationDuration);
    }

    _calculateRatio() {
      // returns true if the img is more vertical than the page
      if (window.innerWidth / window.innerHeight >= this.basicWidth / this.basicHeight) {
        this.newHeight = window.innerHeight - 100;
        this.newWidth = (this.newHeight * this.basicWidth) / this.basicHeight;
      } else {
        this.newWidth = window.innerWidth - 100;
        this.newHeight = (this.newWidth * this.basicHeight) / this.basicWidth;
      }
    }
  }

  Axentix.Config.registerComponent({
    class: Lightbox,
    name: 'Lightbox',
    dataDetection: true,
    autoInit: {
      enabled: true,
      selector: '.lightbox:not(.no-axentix-init)',
    },
  });
})();
