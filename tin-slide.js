/*!
 * TinSlide v0.0.2
 * (c) 2018 Thomas Isberg
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.TinSlide = factory());
}(this, (function () {

    function TinSlide$(container, options) {

        var protected = {

            /**
             *  Properties – all possible to override with options argument.
             */
            debug: false,
            container: null,
            container: null,
            containerWidth: 0,
            items: [],
            numItems: 0,
            numHalfItems: 0,
            pointer: 0,
            pointerVal: 0,
            itemsVisible: {},
            targetVal: 0,
            targetIndex: 0,
            targetIndexWithinBounds: 0,
            timerAnimate: 0,
            // Minimal amount of step required to reach target.
            stepSnap: 0.0003,
            // Step factor every step. Applied on step to target.
            stepFactor: 0.2,
            // Max step every step.
            stepMax: 0.20,
            // Minimum step.
            stepMin: 0.0004,
            // Last step.
            step: 0,
            // Last step – absolute value.
            stepAbs: 0,
            // 0 - 1
            // 0 = No break (will never turn).
            // 1 = Instant break – turns immediately.
            stepTurnBreakFactor: 0.5,
            // Chokes acceleration.
            // Is always between 0 and 1.
            // Is increased on every step upon acceleration (up to 1).
            // Applied max step every step is stepMax * choke.
            choke: 0,
            // Choke is increased by this value every step.
            chokeReleaseStep: 0.05,
            // Choke is multiplied by this value every step.
            chokeReleaseFactor: 1.5,
            // 0 - X
            // 0 = Slow break towards target. Higher values breaks harder.
            // Brings back choke when target is approached.
            // Distance to target multiplied by this value = choke.
            // This is what makes the slider break in on target.
            chokeReturnFactor: 2,
            // Option to crop container (or not).
            cropContainer: true,
            // Desired slide effects.
            effects: {
                slideHorizontal: {
                    on: true,
                    // 0 - x
                    // offset: 0.35
                    offset: 1
                },
                scale: {
                    on: false,
                    // 0 - x
                    min: 0.8,
                    // 0 - x
                    max: 1,
                    minAt: 1.0,
                    maxAt: 0.0
                },
                fade: {
                    on: false,
                    min: 0,
                    max: 1,
                    minAt: 1.0,
                    maxAt: 0
                },
                motionBlur: {
                    on: false,
                    maxPixels: 2,
                    stepMin: 0.05,
                    factor: 500
                }
            },
            // If container height should actively match item height.
            useUpdateContainerHeight: false,
            containerHeight: 0,
            timerUpdateContainerHeight: 0,
            // Optional next / prev navigation on container click.
            useContainerClickNextPrev: false,
            // Optional swipe navigation.
            useSwipeNavigation: true,
            swipePressX: 0,
            timerSwipePress: 0,
            swipePressPointerVal: 0,
            swipeTargetVal: 0,
            timerSwipe: 0,
            swipeStepBreak: 0.4,
            swipeStepFactor: 0.25,
            swipeX: 0,
            swipeXAbs: 0,
            // Optionally wait before invoke grabbing.
            // Useful if the entire container is clickable.
            // Especially if clicking either half navigates to previous / next.
            swipePressWaitBeforeInvokeGrabbing: false,
            swipeReleaseRequiredSwipeX: 0,
            // Optionally generate markup.
            generate: {
                dots: {
                    on: true,
                    afterContainer: true
                },
                nav: {
                    on: true,
                    afterContainer: true
                }
            },
            // Dots.
            dotsItems: null,
            currentDotIndex: null,
            // Next / prev.
            nav: null,
            // Optional ratio.
            ratio: null,
            ratioPercent: null,
            // If slider has height (separate CSS) we can absolute position all slides.
            hasHeight: false,
            // Auto play.
            autoPlay: false,
            timerAutoPlay: 0,
            autoPlayTime: 5000,
            autoPlayState: null,
            autoPlayPauseOnHover: true,
            autoPlayStopOnNavigation: true,
            autoPlayForwards: true,
            // Loop
            loop: true,
            // Non looping next / prev animation when end reached.
            useNonLoopingHint: true,
            timerNonLoopingHint: 0,
            // Base z-index. Slider will get base z, active slide +1.
            // Overlying navigation can be set to higher in separate CSS.
            // Disable zIndex by setting zIndex to 0.
            zIndex: 0,
            // Hide using visibility:hidden instead of display:block.
            // Useful if images aren't loaded as desired.
            hideUsingVisibility: false,
    
            /**
             *  Methods.
             */
            init: function(container, options) {
    
                this.container = container;
                var item, i;
                this.body = document.getElementsByTagName('body')[0];
    
                if(options !== undefined) {
                    this.setOptions(this, options);
                }

                /**
                 *  Replace all tin-slide-image sources with images.
                 */
                var tinSlideImages = container.getElementsByClassName('tin-slide-img');
                var tinSlideImagesArr = [];
                for(i=0, n=tinSlideImages.length; i<n; i++) {
                    tinSlideImagesArr.push(tinSlideImages[i]);
                }
                while(tinSlideImagesArr.length) {
                    var element = tinSlideImagesArr.shift();
                    var img = document.createElement('img');
                    img.setAttribute('src', element.getAttribute('tin-slide-img'));
                    element.replaceWith(img);
                }
    
                /**
                 *  Replace all tin-slide-markup with desired markup.
                 */
                var tinSlideMarkup = container.getElementsByClassName('tin-slide-markup');
                var tinSlideMarkupArr = [];
                for(i=0, n=tinSlideMarkup.length; i<n; i++) {
                    tinSlideMarkupArr.push(tinSlideMarkup[i]);
                }
                while(tinSlideMarkupArr.length) {
                    var element = tinSlideMarkupArr.shift();
                    var template = document.createElement('template');
                    template.innerHTML = element.getAttribute('tin-slide-markup');
                    element.replaceWith(template.content.firstChild);
                }

                var items = [];
                for(i=0, len=this.container.childNodes.length; i<len; i++) {
                    item = this.container.childNodes[i];
                    if(item.nodeType === Node.ELEMENT_NODE) {
                        items.push(item);
                    }
                }
                this.items = items;
                this.numItems = this.items.length;
                this.numHalfItems = this.numItems / 2;
    
                if(this.ratio) {
                    this.ratioPercent = 100 * (1/this.ratio);
                }

                var containerHeight = 0, i;
                for(i=0; i<this.numItems; i++) {
                    item = this.items[i];
                    item.tinSlideIndex = i;
    
                    // Item styles
                    item.style.top = '0';
                    item.style.left = '0';
                    item.style.width = '100%';
                    // if(this.ratio) {
                    //     item.style.marginTop = -this.ratioPercent+'%';
                    // }
    
                    // Hide all items
                    item.style.position = 'absolute';
                    this.hideOrShowElement(item, true);
                }
    
                /**
                 *  Container styles.
                 */
                this.container.style.position = 'relative';
                if(this.cropContainer) {
                    this.container.style.overflow = 'hidden';
                }
                if(this.ratio) {
                    this.container.style.paddingTop = this.ratioPercent+'%';
                }
                if(this.zIndex) {
                    this.container.style.zIndex = this.zIndex;
                }
    
                var that = this;
    
                /**
                 *  Set up prev / next navigation.
                 */
                if(this.useContainerClickNextPrev) {
                    this.container.addEventListener('click', function(event) {
                        var containerWidth = that.getContainerWidth();
                        if(containerWidth) {
                            if((event.clientX - that.container.offsetLeft) < containerWidth / 2) {
                                that.previous();
                            }
                            else {
                                that.next();
                            }
                        }
                    });
                }
    
                /**
                 *  Set up swipe navigation.
                 */
                if(this.items.length > 1) {
                    if(this.useSwipeNavigation) {
    
                        // Swipe styles.
                        this.container.style.cursor = '-webkit-grab';
                        var styles = {
                            'user-drag': 'none',
                            'user-select': 'none',
                            '-moz-user-select': 'none',
                            '-webkit-user-drag': 'none',
                            '-webkit-user-select': 'none',
                            '-ms-user-select': 'none'
                        };
                        for(i=0; i<this.numItems; i++) {
                            this.css(this.items[i], styles);
                            var images = this.items[i].getElementsByTagName('img');
                            for(var j=0, n=images.length; j<n; j++) {
                                this.css(images[j], styles);
                            }
                        }
    
                        // Container swipe events.
                        this.container.addEventListener('touchstart', function(event) {
                            that.onSwipePress(event);
                        });
                        this.container.addEventListener('mousedown', function(event) {
                            that.onSwipePress(event);
                        });
                    }
                }
    
                /**
                 *  If container height should always match selected item.
                 */
                if(this.useUpdateContainerHeight) {
                    window.addEventListener('resize', function() {
                        that.updateContainerHeight();
                    });
                    // Update height every second.
                    this.timerUpdateContainerHeight = setInterval(function() {
                        that.updateContainerHeight();
                    }, 1000);
                }
    
                // Force recalculation of container width on window resize.
                // Calculation will occur when width is needed.
                window.addEventListener('resize', function() {
                    that.containerWidth = 0;
                });
    
                if(this.items.length > 1) {
                    /**
                     *  Generate dots.
                     */
                    if(this.generate.dots.on) {
                        this.dots = this.createDots();
                        this.container.parentNode.insertBefore(
                            this.dots,
                            this.generate.dots.afterContainer ? this.container.nextSibling : this.container
                        );
                    }
    
                    /**
                     *  Generate nav.
                     */
                    if(this.generate.nav.on) {
                        this.nav = this.createNav();
                        this.container.parentNode.insertBefore(
                            this.nav,
                            this.generate.nav.afterContainer ? this.container.nextSibling : this.container
                        );
                    }
                }
    
                // Set slider to initial position.
                this.setPointer(this.targetIndex);
                // Update dots.
                this.updateDots();
                // Start auto play if desired.
                if(this.items.length > 1) {
                    if(this.autoPlay) {
                        this.startAuto();
                    }
                    if(this.autoPlayPauseOnHover) {
                        this.container.addEventListener('mouseenter', function(event) {
                            that.pauseAuto();
                        });
                        this.container.addEventListener('mouseleave', function(event) {
                            that.resumeAuto();
                        });
                    }
                }

            },
            css: function(element, styles) {
                for(var style in styles) {
                    element.style[style] = styles[style];
                }
            },
            addClass(element, className) {
                var classes = element.className.split(' ');
                if(classes.indexOf(className) === -1) {
                    classes.push(className);
                }
                element.className = classes.join(' ');
            },
            removeClass(element, className) {
                var classes = element.className.split(' ');
                var idx = classes.indexOf(className);
                if(idx !== -1) {
                    classes.splice(idx, 1);
                }
                element.className = classes.join(' ');
            },
            hasClass(element, className) {
                var classes = element.className.split(' ');
                return classes.indexOf(className) > -1;
            },
            hideOrShowElement: function(element, hide) {
                if(this.hideUsingVisibility) {
                    element.style.visibility = hide ? 'hidden' : 'visible';
                }
                else {
                    element.style.display = hide ? 'none' : 'block';
                }
            },
            /**
             *  Recursively copies options.
             */
            setOptions: function(scope, options) {
                for(var v in options) {
                    var type = typeof scope[v];
                    // Only store option if it is of correct type.
                    if(type === typeof options[v] || scope[v] === null) {
                        // Don't overwrite objects – just copy the primitive values.
                        if(type === 'object' && scope[v] !== null) {
                            this.setOptions(scope[v], options[v]);
                        }
                        else {
                            scope[v] = options[v];
                        }
                    }
                }
            },
            createDots: function() {
    
                /**
                 *  Dots.
                 */
                var that = this;
                var ul = document.createElement("UL");
                ul.setAttribute('class', 'tin-slide-dots');
                var liClickHandler = function(event) {
                    that.onDotClick(event);
                };
                this.dotsItems = [];
                for(i=0; i<this.numItems; i++) {
                    var li = document.createElement('LI');
                    li.setAttribute('class', 'tin-slide-dot-'+i);
                    li.setAttribute('tin-slide-index', i);
                    li.style.cursor = 'pointer';
                    ul.appendChild(li);
                    this.dotsItems.push(li);
                    li.addEventListener('click', liClickHandler)
                }
                return ul;
    
            },
            createNav: function() {
    
                /**
                 *  Next / prev.
                 */
                var that = this;
                var nav = document.createElement("NAV");
                nav.setAttribute('class', 'tin-slide-next-prev');
    
                var prev = document.createElement("DIV");
                prev.setAttribute('class', 'tin-slide-prev');
                prev.style.cursor = 'pointer';
                prev.addEventListener('click', function(event) {
                    that.previous();
                });
                nav.appendChild(prev);
    
                var next = document.createElement("DIV");
                next.setAttribute('class', 'tin-slide-next');
                next.style.cursor = 'pointer';
                next.addEventListener('click', function(event) {
                    that.next();
                });
                nav.appendChild(next);
                return nav;
    
            },
    
            /**
             *  Update the slider.
             */
            setPointer: function(val) {
    
                this.pointerVal = val;
                var pointer = val % this.numItems;
                if(pointer < 0 && this.loop) {
                    pointer += this.numItems;
                }
                this.pointer = pointer;
    
                // Visible items – first add the floor index.
                var visibleItems = [];
                var floorPointer = Math.floor(this.pointer);
                if(floorPointer >= 0) {
                    visibleItems.push(this.items[floorPointer]);
                }
                // Add ceil index if pointer is not at destination.
                if(this.pointer !== floorPointer) {
                    var ceilPointer = Math.ceil(this.pointer);
                    if(this.loop) {ceilPointer %= this.numItems;}
                    if(ceilPointer < this.items.length) {
                        visibleItems.push(this.items[ceilPointer]);
                    }
                }
                var index;
                // Mark previously visible items for check.
                for(index in this.itemsVisible) {
                    this.itemsVisible[index] = null;
                }
                var item;
                var len=visibleItems.length;
    
                for(var i=0; i<len; i++) {
                    item = visibleItems[i];
                    // If previously non visible item becomes visible.
                    if(this.itemsVisible[item.tinSlideIndex] === undefined) {
                        this.hideOrShowElement(item, false);
                    }
                    // Store progress.
                    var progress = this.pointer - item.tinSlideIndex;
                    if(progress > 1) {progress -= this.numItems;}
                    this.itemsVisible[item.tinSlideIndex] = progress;
    
                    // Make the most visible item relatively positioned,
                    // and put it in front of the others.
                    var relativeItem = false;
                    if(!(progress > 0.5 || progress < -0.5) && !relativeItem) {
                        relativeItem = true;
                        // All slides absolute positioned if slider has a defined height
                        // (in separate CSS) or ratio.
                        if(!(this.ratio || this.hasHeight)) {
                            item.style.position = 'relative';
                        }
                        if(this.zIndex) {
                            visibleItems[i].style.zIndex = this.zIndex + 1;
                        }
                    }
                    else {
                        item.style.position = 'absolute';
                        item.style.zIndex = '';
                    }
    
                }
                // Hide previously visible items no longer visible.
                for(index in this.itemsVisible) {
                    if(this.itemsVisible[index] === null) {
                        delete this.itemsVisible[index];
                        item = this.items[index];
                        this.hideOrShowElement(item, true);
                        item.style.position = 'absolute';
                    }
                }
                this.applySlideEffect();
            },
    
            /**
             *  Next/ previous.
             */
            next: function(isAuto) {
                var status = false;
                if(this.items.length > 1) {
                    // Stop auto play if not an auto play navigation.
                    if(isAuto !== true) {
                        if(this.autoPlayStopOnNavigation) {
                            this.stopAuto();
                        }
                    }
                    if(!this.timerSwipe) {
                        // Navigate if slider is looping, or if there are previous slides.
                        if(this.loop || this.targetIndex < this.numItems - 1) {
                            this.targetIndex++;
                            this.targetVal = this.targetIndex;
                            this.animateToTarget();
                            status = true;
                        }
                        else if(!isAuto && this.useNonLoopingHint) {
                            this.targetVal = this.numItems - 1 + 0.05;
                            this.animateToTarget();
                            var that = this;
                            this.timerNonLoopingHint = setTimeout(function() {
                                that.targetVal = that.targetIndex;
                                that.animateToTarget();
                            }, 200);
                        }
                    }
                }
                return status;
            },
            previous: function(isAuto) {
                var status = false;
                if(this.items.length > 1) {
                    // Stop auto play if not an auto play navigation.
                    if(isAuto !== true) {
                        if(this.autoPlayStopOnNavigation) {
                            this.stopAuto();
                        }
                    }
                    if(!this.timerSwipe) {
                        // Navigate if slider is looping, or if there are previous slides.
                        if(this.loop || this.targetIndex > 0) {
                            this.targetIndex--;
                            this.targetVal = this.targetIndex;
                            this.animateToTarget();
                            status = true;
                        }
                        else if(!isAuto && this.useNonLoopingHint) {
                            this.targetVal = -0.05;
                            this.animateToTarget();
                            var that = this;
                            this.timerNonLoopingHint = setTimeout(function() {
                                that.targetVal = that.targetIndex;
                                that.animateToTarget();
                            }, 200);
                        }
                    }
                }
                return status;
            },
            /**
             *  Swipe.
             */
            // Performs the actual grabbing – stops slider etc.
            onSwipePress: function(event) {
    
                if(this.items.length > 1) {
                    var isTouch = event.type === 'touchstart';
    
                    // If link was pressed – do nothing.
                    if(event.target.nodeName === 'A') {
                        return;
                    }
    
                    /**
                     *  Don't respond to right click.
                     */
                    var nativeEvent = event;
                    if((nativeEvent.button !== undefined && nativeEvent.button === 2) || (nativeEvent.which !== undefined && nativeEvent.which === 3)) {
                        return;
                    }
    
                    this.container.style.cursor = '-webkit-grabbing';
    
                    this.swipePressX = isTouch ? event.layerX : event.clientX;
                    this.swipeX = 0;
                    this.swipeXAbs = 0;
    
                    if(this.swipePressWaitBeforeInvokeGrabbing) {
                        var that = this;
                        // Wait before invoke grabbing.
                        clearTimeout(this.timerSwipePress);
                        this.timerSwipePress = setTimeout(function() {
                            that.onTimerSwipePress();
                        }, 25 * 3);
                        var handlers = {
                            onRelease: function() {
                                clearTimeout(that.timerSwipePress);
                                document.removeEventListener('touchend', this.onRelease);
                                document.removeEventListener('mouseup', this.onRelease);
                            }
                        };
                        document.addEventListener('touchend', handlers.onRelease);
                        document.addEventListener('mouseup', handlers.onRelease);
                    }
                    else {
                        this.onTimerSwipePress();
                    }
                }
    
            },
            // Performs the actual grabbing – stops slider etc.
            onTimerSwipePress: function() {
    
                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);
    
                // Stop auto play.
                if(this.autoPlayStopOnNavigation) {
                    this.stopAuto();
                }
    
                if(this.timerAnimate) {
                    clearInterval(this.timerAnimate);
                    this.timerAnimate = 0;
                }
    
                // Calculate how far the slide will travel upon press.
                var step = 0;
                var stepAdd = this.step;
                for(i=0; i<25; i++) {
                    stepAdd *= this.swipeStepFactor;
                    step += stepAdd;
                }
    
                this.swipePressPointerVal = this.pointerVal + step;
                this.swipeTargetVal = this.swipePressPointerVal;
    
                var that = this;
                var handlers = {
                    onSwipeMove: function(event) {
                        that.onSwipeMove(event);
                    },
                    onSwipeRelease: function() {
                        document.removeEventListener('touchmove', handlers.onSwipeMove);
                        document.removeEventListener('mousemove', handlers.onSwipeMove);
                        document.removeEventListener('touchend', handlers.onSwipeRelease);
                        document.removeEventListener('mouseup', handlers.onSwipeRelease);
                        that.onSwipeRelease();
                    }
                };
                document.addEventListener('touchmove', handlers.onSwipeMove);
                document.addEventListener('mousemove', handlers.onSwipeMove);
                document.addEventListener('touchend', handlers.onSwipeRelease);
                document.addEventListener('mouseup', handlers.onSwipeRelease);
                this.startSwipeTimer();
            },
            onSwipeRelease: function() {

                this.container.style.cursor = '-webkit-grab';
                if(this.swipeXAbs >= this.swipeReleaseRequiredSwipeX) {
                    var limit = 0.04;
                    var targetIndex;
                    if(this.step < -limit) {
                        targetIndex = Math.floor(this.pointerVal);
                    }
                    else if(this.step > limit) {
                        targetIndex = Math.ceil(this.pointerVal);
                    }
                    else {
                        // Calculate how far the slide will travel upon release.
                        var step = this.step * 15;
                        var stepAdd = this.step;
                        for(i=0; i<80; i++) {
                            stepAdd *= this.swipeStepFactor;
                            step += stepAdd;
                        }
                        var targetVal = this.pointerVal + step;
                        targetIndex = Math.round(targetVal);
                    }
    
                    this.choke = 1;
    
                    // Wait a few milliseconds, otherwise prev / next will be invoked.
                    var that = this;
                    setTimeout(function() {
                        if(that.timerSwipe) {
                            clearInterval(that.timerSwipe);
                            that.timerSwipe = 0;
                        }
                        // that.animateTo(targetIndex);
                        that.targetIndex = targetIndex;
                        that.targetVal = that.targetIndex;
                        that.animateToTarget();
                    }, 1);
                }
                else {
                    clearInterval(this.timerSwipe);
                    this.timerSwipe = 0;
                }
    
            },
            onSwipeMove: function(event) {
                // Check if child slider is swiping.
                // If so, lock this parent slider until child slider no longer wipes (first / last slide reached).
                // Child sliders must have loop=false. Otherwise this parent slider will
                // never slide again once child slider has been grabbed.
                if(event.tinSlideMoved === undefined) {
    
                    var isTouch = event.type === 'touchmove';
    
                    var containerWidth = this.getContainerWidth();
                    if(containerWidth) {
                        this.swipeX = this.swipePressX - (isTouch ? event.layerX : event.clientX);
                        this.swipeXAbs = this.swipeX < 0 ? -this.swipeX : this.swipeX;
                        var swipeTargetVal = this.swipePressPointerVal + (this.swipeX / containerWidth);
                        if(!this.loop) {
                            var offset = this.useNonLoopingHint ? 0.05 : 0;
                            if(swipeTargetVal < -offset) {swipeTargetVal = -offset;}
                            else if(swipeTargetVal > this.numItems - 1 + offset) {swipeTargetVal = this.numItems - 1 + offset;}
                            else {
                                event.tinSlideMoved = true;
                            }
                        }
                        this.swipeTargetVal = swipeTargetVal;
                        var targetIndexWithinBounds = Math.round(this.swipeTargetVal) % this.numItems;
                        if(targetIndexWithinBounds < 0) {targetIndexWithinBounds += this.numItems;}
                        this.targetIndexWithinBounds = targetIndexWithinBounds;
                        this.updateDots();
                    }
                }
            },
            startSwipeTimer: function() {
                if(!this.timerSwipe) {
                    var that = this;
                    this.timerSwipe = setInterval(function() {
                        that.onTimerSwipe();
                    }, 25);
                }
            },
            onTimerSwipe: function() {
                var pointerVal = this.pointerVal;
                var diff = this.swipeTargetVal - pointerVal;
                var step = diff * this.swipeStepFactor;
                this.step = step;
                this.stepAbs = this.step < 0 ? -this.step : this.step;
                pointerVal += step;
                this.setPointer(pointerVal);
            },
            getContainerWidth: function() {
                if(!this.containerWidth) {
                    this.containerWidth = container.offsetWidth;
                }
                return this.containerWidth;
            },
    
            /**
             *  Animate to index.
             */
            animateTo: function(index) {
                this.targetIndex = index % this.numItems;
                if(this.targetIndex < 0) {
                    this.targetIndex += this.numItems;
                }
                this.targetIndexWithinBounds = this.targetIndex;
                this.updateDots();
                var pointerVal = this.pointerVal % this.numItems;
                // Adjust pointerVal so slider chooses optimal direction.
                if(this.loop) {
                    var diff = pointerVal - this.targetIndex;
                    if(diff > this.numHalfItems) {
                        pointerVal -= this.numItems;
                    }
                    else if(diff < -this.numHalfItems) {
                        pointerVal += this.numItems;
                    }
                }
                this.pointerVal = pointerVal;
                this.targetVal = this.targetIndex;
                this.animateToTarget();
            },
            animateToTarget: function() {
                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);
                // Update dots.
                var targetIndexWithinBounds = this.targetIndex % this.numItems;
                if(targetIndexWithinBounds < 0) {
                    targetIndexWithinBounds += this.numItems;
                }
                this.targetIndexWithinBounds = targetIndexWithinBounds;
                this.updateDots();
                if(this.useUpdateContainerHeight) {
                    this.updateContainerHeight();
                }
                if(!this.timerAnimate) {
                    var that = this;
                    this.timerAnimate = setInterval(function() {
                        that.onAnimationTimer();
                    }, 25);
                }
            },
            onAnimationTimer: function() {
                var pointerVal = this.pointerVal;
                var diff = this.targetVal - pointerVal;
                var diffAbs = diff < 0 ? -diff : diff;
                if(diffAbs < this.stepSnap) {
                    this.step = this.stepAbs = 0;
                    this.setPointer(this.targetVal);
                    clearInterval(this.timerAnimate);
                    this.timerAnimate = 0;
                }
                else {
                    var step = (diff) * this.stepFactor;
                    // If slider continues in the same direction.
                    if(step * this.step >= 0) {
                        this.step = (diff) * this.stepFactor;
                        // Release the choke for acceleration.
                        if(this.choke < 1) {
                            this.choke = (this.choke * this.chokeReleaseFactor) + (this.choke || this.chokeReleaseStep ? this.chokeReleaseStep : 0.05);
                        }
                        // Decrease choke when target is approached.
                        if(this.choke > diffAbs) {
                            this.choke = diffAbs * (0.5 + this.chokeReturnFactor);
                        }
                        if(this.choke > 1) {
                            this.choke = 1;
                        }
                        if(this.step > this.stepMin || this.step < -this.stepMin) {
                            var stepMax = this.choke * this.stepMax;
                            if(this.step > stepMax) {this.step = stepMax;}
                            else if(this.step < -stepMax) {this.step = -stepMax;}
                            if(!(this.step > this.stepMin || this.step < -this.stepMin)) {
                                this.step = this.stepMin * (this.step < 0 ? -1 : 1);
                            }
                        }
                        this.stepAbs = this.step < 0 ? -this.step : this.step;
                        pointerVal += this.step;
                    }
                    // If slider changes direction – break and turn.
                    else {
                        step = this.step * (1-this.stepTurnBreakFactor);
                        // If turning break has completed.
                        if(!(step > this.stepSnap || step < -this.stepSnap)) {
                            this.step = 0;
                        } else {
                            this.step = step;
                        }
                        pointerVal += step;
                    }
                    this.stepAbs = this.step < 0 ? -this.step : this.step;
                    this.setPointer(pointerVal);
                }
            },
            goTo: function(index) {
                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);
                // Stop auto play.
                if(this.autoPlayStopOnNavigation) {
                    this.stopAuto();
                }
                // Stop animation.
                if(this.timerAnimate) {
                    clearInterval(this.timerAnimate);
                    this.timerAnimate = 0;
                }
                // Calculate correct target index.
                this.targetIndex = index % this.numItems;
                if(this.targetIndex < 0) {
                    this.targetIndex += this.numItems;
                }
                this.targetIndexWithinBounds = this.targetIndex;
                this.updateDots();
                if(this.useUpdateContainerHeight) {
                    this.updateContainerHeight();
                }
                this.setPointer(this.targetIndexWithinBounds);
            },
            updateContainerHeight: function() {
                var containerHeight = this.items[this.targetIndexWithinBounds].offsetHeight;
                if(this.containerHeight !== containerHeight) {
                    this.containerHeight = containerHeight;
                    this.css(this.container, {
                        height: containerHeight+'px'
                    });
                }
            },
            /**
             *  Apply desired slide effect:
             *   - Horizontal slide
             *   - Fade
             *   - Motion blur
             */
            applySlideEffect: function() {
                for(var index in this.itemsVisible) {
    
                    var item = this.items[index];
                    var progress = this.itemsVisible[index];
                    var progressAbs = progress < 0 ? -progress : progress;
                    var transforms = [];
    
                    // Horizontal slide.
                    if(this.effects.slideHorizontal.on) {
                        transforms.push('translateX('+((this.effects.slideHorizontal.offset*100)*-progress)+'%)');
                    }
    
                    // Scale
                    if(this.effects.scale.on) {
                        var scale;
                        if(progressAbs < this.effects.scale.maxAt) {
                            scale = this.effects.scale.max;
                        }
                        else if(progressAbs < this.effects.scale.minAt) {
                            var scaleFactor = 1 - ((progressAbs - this.effects.scale.maxAt) / (this.effects.scale.minAt - this.effects.scale.maxAt));
                            scale = this.effects.scale.min + scaleFactor * (this.effects.scale.max - this.effects.scale.min);
                        }
                        else {
                            scale = this.effects.scale.min;
                        }
                        // var scale = this.effects.scale.min + (1 - (progress < 0 ? -progress : progress)) * (this.effects.scale.max - this.effects.scale.min);
                        transforms.push('scale('+scale+', '+scale+')');
                    }
    
                    // Apply accumulated transforms.
                    if(transforms.length) {
                        item.style.transform = transforms.join(' ');
                    }
    
                    // Fade
                    if(this.effects.fade.on) {
                        var opacity;
                        if(progressAbs < this.effects.fade.maxAt) {
                            opacity = this.effects.fade.max;
                        }
                        else if(progressAbs < this.effects.fade.minAt) {
                            var opacityFactor = 1 - ((progressAbs - this.effects.fade.maxAt) / (this.effects.fade.minAt - this.effects.fade.maxAt));
                            opacity = this.effects.fade.min + opacityFactor * (this.effects.fade.max - this.effects.fade.min);
                        }
                        else {
                            opacity = this.effects.fade.min;
                        }
                        item.style.opacity = opacity;
                        /**
                         *  Hide elements completely faded out.
                         */
                        // if(opacity) {
                        //     if(item.style.display === 'none') {
                        //         item.style.display = 'block';
                        //     }
                        // }
                        // else {
                        //     // Don't hide the relatively positioned element,
                        //     // as the container will loose its height.
                        //     if(item.style.position != 'relative' && item.style.display !== 'none') {
                        //         item.style.display = 'none';
                        //     }
                        // }
                    }
                }
    
                // Motion blur.
                if(this.effects.motionBlur.on) {
                    this.applyBlur();
                }
            },
            /**
             *  Speed based blur.
             */
            applyBlur: function() {
                var blurFactor = this.stepAbs - this.effects.motionBlur.stepMin;
                if(blurFactor < 0) {blurFactor = 0;}
                var blur = blurFactor * this.effects.motionBlur.factor;
                if(blur > this.effects.motionBlur.maxPixels) {blur = this.effects.motionBlur.maxPixels;}
                var cssBlur = blur ? 'blur('+blur+'px)' : '';
                for(var index in this.itemsVisible) {
                    this.items[index].style.filter = cssBlur;
                }
            },
            updateDots: function() {
                if(this.dots && this.currentDotIndex !== this.targetIndexWithinBounds) {
                    var dot;
                    if(this.currentDotIndex !== null) {
                        dot = this.dotsItems[this.currentDotIndex];
                        this.removeClass(dot, 'on');
                    }
                    this.currentDotIndex = this.targetIndexWithinBounds;
                    dot = this.dotsItems[this.currentDotIndex];
                    this.addClass(dot, 'on');
                }
            },
            onDotClick: function(event) {
                // Stop auto play.
                if(this.autoPlayStopOnNavigation) {
                    this.stopAuto();
                }
                var index = parseInt(event.target.getAttribute('tin-slide-index'), 10);
                this.animateTo(index);
            },
            startAuto: function() {
                if(this.autoPlayState !== 'started') {
                    this.autoPlayState = 'started';
                    this.resumeAuto();
                }
            },
            pauseAuto: function() {
                // Don't do anything if auto play isn't activated.
                if(this.autoPlayState) {
                    this.autoPlayState = 'paused';
                    clearInterval(this.timerAutoPlay);
                    this.timerAutoPlay = 0;
                }
            },
            resumeAuto: function() {
                // Don't do anything if auto play isn't activated.
                if(this.autoPlayState) {
                    this.autoPlayState = 'started';
                    var that = this;
                    this.timerAutoPlay = setInterval(function() {
                        // Only auto slide if slider is visible.
                        // Also don't slide if window isn't visible.
                        if(that.container.clientHeight && !that.hasClass(that.body, 'window-hidden')) {
                            var status = that.autoPlayForwards ? that.next(true) : that.previous(true);
                            // Change direction if navigation failed.
                            if(!status) {
                                that.autoPlayForwards = !that.autoPlayForwards;
                                status = that.autoPlayForwards ? that.next(true) : that.previous(true);
                            }
                        }
                    }, this.autoPlayTime);
                }
            },
            stopAuto: function() {
                if(this.autoPlayState) {
                    this.pauseAuto();
                    this.autoPlayState = null;
                }
            },
        };
    
        // Initialize.
        protected.init(container, options);

        /**
         *  Public methods.
         */
        this.next = function(index) {
            protected.next();
        };
        this.previous = function(index) {
            protected.previous();
        };
        this.animateTo = function(index) {
            protected.animateTo(index);
        };
        this.goTo = function(index) {
            protected.goTo(index);
        };
        this.getDots = function() {
            return protected.dots ? protected.dots : protected.createDots();
        };
        this.getNav = function() {
            return protected.nav ? protected.nav : protected.createNav();
        };
        this.startAuto = function() {
            protected.startAuto();
        };
        this.stopAuto = function() {
            protected.stopAuto();
        };

        /**
         *  Experimentally check if window is hidden.
         *  Used to pause autoplay when window is hidden.
         */
        // var hidden = null;
        // if (hidden = "hidden" in document) {
        //     document.addEventListener("visibilitychange", onchange);
        // }
        // else if ((hidden = "mozHidden") in document) {
        //     document.addEventListener("mozvisibilitychange", onchange);
        // }
        // else if ((hidden = "webkitHidden") in document) {
        //     document.addEventListener("webkitvisibilitychange", onchange);
        // }
        // else if ((hidden = "msHidden") in document) {
        //     document.addEventListener("msvisibilitychange", onchange);
        // }
        // // IE 9 and lower:
        // else if ("onfocusin" in document) {
        //     document.onfocusin = document.onfocusout = onchange;
        // }
        // // All others:
        // else {
        //     window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
        // }
        // // set the initial state (but only if browser supports the Page Visibility API)
        // if(hidden && document[hidden] !== undefined) {
        //     onchange({type: document[hidden] ? "blur" : "focus"});
        // }

        return true;

    }

    return TinSlide$;

})));