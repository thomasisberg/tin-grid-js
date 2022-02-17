/*!
 * TinGrid v0.1.17
 * (c) 2018 Thomas Isberg
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.TinGrid = factory());
}(this, (function () {

    /*----------------------------------------------------
    | Helpers.
    |---------------------------------------------------*/
    function isEmpty (value) {
        return value === undefined || value === null || value === '';
    }
    function isTrue (value) {
        return value === true || value === 'true' || value === 1 || value === '1';
    }
    function isObject (value) {
        return typeof value === 'object' && value !== null;
    }
    function hasClass (element, className) {
        // if (typeof element.className !== 'string') {
        //     return false;
        // }
        // return element.className.split(' ').indexOf(className) >= 0;
        return element.classList.contains(className);
    }
    function addClass (element, className) {
        if (!hasClass(element, className)) {
            // element.className = isEmpty(element.className) ? className : element.className + ' '  + className;
            element.classList.add(className);
        }
    }
    function removeClass (element, className) {
        if (hasClass(element, className)) {
            // var classNames = element.className.split(' ');
            // var index = classNames.indexOf(className);
            // classNames.splice(index, 1);
            // element.className = classNames.join(' ');
            element.classList.remove(className);
        }
    }

    /*----------------------------------------------------
    | Constructor.
    |---------------------------------------------------*/
    function TinGrid$(container, options) {

        /*----------------------------------------------------
        | Settings & options.
        |---------------------------------------------------*/
        var settings = {
            columnBreakpoints: [470, 660, 930, 1200, 1560, 1880], // Adds one column per breakpoint.
            wideColSpan: 2,          // Column span for wide items. Specify array for different setting per break point.
            itemHeightType: 'auto',  // "auto", "fixed" or "ratio".
            itemHeight: null,        // Number (pixels) for itemHeightType "fixed", Number (width / height) for itemHeightType "ratio".
            wideItemHeight: null,    // Height of wide item. Otherwise same as itemHeight. Falls back to itemHeight if necessary.
            useTransition: false,    // If itemHeightType is "auto", the width and height of the items will not be animated.
            transitionTime: '400ms', // Transition time.
            transitionEasing: 'cubic-bezier(.48,.01,.21,1)', // Transition easing equation.
            minOffsetYNextColumn: 0, // How much higher up must a following column place item to be selected in favour of the preceeding column.
            useOptimizedPositions: true, // Disable if items should always be placed in the next column.
            normalizationOffsetYThreshold: 0, // If the difference between two columns is within threshold, they will get the same offset.
            normalizationOffsetYThresholdPercent: 0 // Normalization threshold in percent of column width. Overrides normalizationOffsetYThreshold, and is calculated from normalizationOffsetYThreshold if it is string.
        }
        if (isObject(options)) {
            for (var v in settings) {
                if (options[v] !== undefined) {
                    settings[v] = options[v];
                }
            }
        }
        if (Array.isArray(settings.wideColSpan) && settings.wideColSpan.length !== settings.columnBreakpoints.length + 1) {
            console.error('TinGrid: When specifying wide col spans for break points, you must specify exactly one col span per breakpoint. Expected ' + (settings.columnBreakpoints.length+1) + ' but found ' + settings.wideColSpan.length);
            return;
        }
        if (settings.itemHeightType !== 'auto' && typeof settings.itemHeight !== 'number') {
            console.error('TinGrid: You must specify itemHeight as a Number.');
            return;
        }
        if (settings.wideItemHeight !== null && typeof settings.wideItemHeight !== 'number') {
            console.error('TinGrid: You must specify wideItemHeight as null or a Number');
            return;
        }
        if (settings.wideItemHeight === null) {
            settings.wideItemHeight = settings.itemHeight;
        }
        if (settings.normalizationOffsetYThreshold) {
            var normalization = settings.normalizationOffsetYThreshold;
            if (typeof normalization === 'string') {
                var idx = normalization.indexOf('%');
                if (idx === false) {
                    console.error('TinGrid: When specifying normalizationOffsetYThreshold as a string you must include the percent character, for example "50%".');
                    return;
                }
                settings.normalizationOffsetYThresholdPercent = parseInt(normalization.substr(0, idx), 10) / 100;
                if (isNaN(settings.normalizationOffsetYThresholdPercent)) {
                    console.error('TinGrid: Could not calculate normalizationOffsetYThreshold in percent.');
                    return;
                }
            }
        }
        if (settings.normalizationOffsetYThresholdPercent) {
            if (typeof settings.normalizationOffsetYThresholdPercent !== 'number') {
                console.error('TinGrid: normalizationOffsetYThresholdPercent must be defined as a Number.');
                return;
            }
        }

        /*----------------------------------------------------
        | General variables.
        |---------------------------------------------------*/
        var tableau_num_cols;
        var tableau_timer = 0;
        var tableau_data = [];
        var wideColSpan = 1;

        /*----------------------------------------------------
        | Add tableau (grid).
        | Will make it easy to implement "load more"
        | in the future.
        |---------------------------------------------------*/
        tableau_add(container);
        if(tableau_data.length) {
            tableau_update();
            window.addEventListener('resize', tableau_update);
        }

        function tableau_add (tableau_element) {
            
            var i, j, x, n;

            var ul = tableau_element.querySelector('ul');
            if (!ul) {
                ul = tableau_element.querySelector('.container');
            }
            
            /*----------------------------------------------------
            | Store items.
            |---------------------------------------------------*/
            var items = [];
            var ul_li = ul.children;
            for (i = 0; i < ul_li.length; i++) {
                var li = ul_li[i];
                li.style.position = 'absolute';
                if (settings.useTransition) {
                    var transition = 'top ' + settings.transitionTime + ' ' + settings.transitionEasing + ', left ' + settings.transitionTime + ' ' + settings.transitionEasing;
                    if (settings.itemHeightType !== 'auto') {
                        transition += ', width ' + settings.transitionTime + ' ' + settings.transitionEasing + ', height ' + settings.transitionTime + ' ' + settings.transitionEasing;
                    }
                    li.style.transition = transition;
                }
                items.push(li);
            }

            /*----------------------------------------------------
            | Optionally randomize items.
            |---------------------------------------------------*/
            if (isTrue(tableau_element.getAttribute('data-randomized'))) {
                function shuffle(o) { //v1.0
                    for (j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                    return o;
                };
                items = shuffle(items);
            }
            
            /*----------------------------------------------------
            | Store tableau with parsed elements etc.
            |---------------------------------------------------*/
            tableau_data.push({
                tableau: tableau_element,
                ul: ul,
                items: items,
                cols: [],
                cols_real: [],
                cols_normalization: [],
                cols_items: []
            });

            /*----------------------------------------------------
            | Update tableau on image load.
            |---------------------------------------------------*/
            var images = tableau_element.querySelectorAll('img');
            for (i = 0, n = images.length; i < n; i++) {
                images[i].addEventListener('load', tableau_update);
            }
        }

        function tableau_remove (index) {
            if (tableau_data.length > index) {
                const item = tableau_data.splice(index, 1)[0];
                const tableau_element = item.tableau;
                const images = tableau_element.querySelectorAll('img');
                const n = images.length;
                for (let i = 0; i < n; i++) {
                    images[i].removeEventListener('load', tableau_update);
                }
            }
        }

        function tableau_remove_all () {
            while (tableau_data.length) {
                tableau_remove(0);
            }
        }

        /*----------------------------------------------------
        | Update all tableaus registered by this instance.
        |---------------------------------------------------*/
        function tableau_update () {

            var w_win, i, j, k, n, tableau_item, item, items, len, maxIdx, currentColIdx, colSpan, minY;
            
            clearTimeout(tableau_timer);
            tableau_timer = setTimeout(tableau_update, 3000);
            
            /*----------------------------------------------------
            | Iterate tableaus.
            |---------------------------------------------------*/
            for (n = 0; n < tableau_data.length; n++) {
                
                tableau_item = tableau_data[n];
                const tableau_element = tableau_item.tableau;

                w_win = tableau_element.offsetWidth;

                /*----------------------------------------------------
                | Calculate number of columns for current width.
                |---------------------------------------------------*/
                tableau_num_cols = 1;
                for (i = 0, j = settings.columnBreakpoints.length; i < j; i++) {
                    if (w_win < settings.columnBreakpoints[i]) {
                        break;
                    }
                    tableau_num_cols++;
                }
                tableau_element.setAttribute('tin-grid-cols', tableau_num_cols);

                wideColSpan = Array.isArray(settings.wideColSpan) ? settings.wideColSpan[tableau_num_cols - 1] : settings.wideColSpan;
                if(wideColSpan > tableau_num_cols) {
                    wideColSpan = tableau_num_cols;
                }

                /*----------------------------------------------------
                | Current column width.
                |---------------------------------------------------*/
                var w_col_perc = 100 / tableau_num_cols;
                var w_col = Math.floor((1 / tableau_num_cols) * w_win);

                /* -----------------------------------------------------------
                | Calculate normalization threshold, if percent.
                |---------------------------------------------------------- */
                var normalizationThreshold = settings.normalizationOffsetYThreshold;
                if (settings.normalizationOffsetYThresholdPercent) {
                    normalizationThreshold = settings.normalizationOffsetYThresholdPercent * w_col;
                }
                
                /*----------------------------------------------------
                | Reset columns.
                |---------------------------------------------------*/
                tableau_item.cols = [];
                tableau_item.cols_real = [];
                tableau_item.cols_normalization = [];
                tableau_item.cols_items = [];
                for (i = 0; i < tableau_num_cols; i++) {
                    tableau_item.cols[i] = 0;
                    tableau_item.cols_real[i] = 0;
                    tableau_item.cols_normalization[i] = 0;
                    tableau_item.cols_items[i] = [];
                }
                
                /*----------------------------------------------------
                | Create array of items.
                | Filtering should be done here.
                |---------------------------------------------------*/
                items = [];
                for (i = 0, len = tableau_item.items.length; i < len; i++) {
                    item = tableau_item.items[i];
                    if (!hasClass(item, 'off')) {
                        items.push(item);
                    }
                }

                /*----------------------------------------------------
                | Sort array if sorting seems to be defined.
                |---------------------------------------------------*/
                if(items.length && !isEmpty(items[0].getAttribute('tin-grid-sort'))) {
                    items.sort(function (a, b) {
                        return parseInt(a.getAttribute('tin-grid-sort'), 10) - parseInt(b.getAttribute('tin-grid-sort'), 10);
                    });
                }
                
                maxIdx = 0;
                currentColIdx = -1;
                
                /*----------------------------------------------------
                | Go through items.
                |---------------------------------------------------*/
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    var itemIsWide = tableau_num_cols > 1 ? hasClass(item, 'wide') : false;

                    colSpan = itemIsWide ? wideColSpan : 1;

                    /* -----------------------------------------------------------
                    | Set item width and possibly height, depending on itemHeightType setting.
                    |---------------------------------------------------------- */
                    item.style.width = (w_col_perc*colSpan) + '%';
                    var itemHeight = getItemHeight(item, itemIsWide, w_col);

                    currentColIdx = (currentColIdx + 1) % tableau_num_cols;
                    var colIdx = currentColIdx;

                    /* -----------------------------------------------------------
                    | Place the item in column.
                    | 1. Check if there is a gap somewhere that is big enough.
                    | 2. Make sure wide items don't get placed at last column. Preferrably alter between pulling back a column and pushing to first column.
                    | 3. Store / update gaps.
                    |---------------------------------------------------------- */
                    if (settings.useOptimizedPositions) {  
                        var colIdx = 0;
                        minY = Number.MAX_VALUE;
                        for (j = 0; j < tableau_num_cols - (colSpan - 1); j++) {
                            var colY = tableau_item.cols[j];
                            for (k = 1; k < colSpan; k++) {
                                if (tableau_item.cols[j + k] > colY) {
                                    colY = tableau_item.cols[j + k];
                                }
                            }
                            if (colY < minY - settings.minOffsetYNextColumn) {
                                colIdx = j;
                                minY = colY;
                            }
                        }
                    } else {
                        /* -----------------------------------------------------------
                        | Calculate y position.
                        |---------------------------------------------------------- */
                        minY = 0;
                        for (j = 0; j < colSpan; j++) {
                            if (tableau_item.cols[colIdx + j] > minY) {
                                minY = tableau_item.cols[colIdx + j];
                            }
                        }
                    }

                    /*----------------------------------------------------
                    | If the item had a preferred position.
                    |---------------------------------------------------*/
                    if (!isEmpty(item.getAttribute('tin-grid-position'))) {
                        var position = item.getAttribute('tin-grid-position');
                        if (position === 'left') {
                            colIdx = 0;
                        }
                        else if (position === 'center') {
                            colIdx = Math.floor((tableau_num_cols-colSpan) / 2)
                        }
                        else if (position === 'right') {
                            colIdx = tableau_num_cols-colSpan;
                        }
                    }

                    /*----------------------------------------------------
                    | Handle gaps.
                    |---------------------------------------------------*/
                    if (colSpan > 1 && settings.useOptimizedPositions) {
                    
                        /* -----------------------------------------------------------
                        | If the gap gets smaller by putting the next single column
                        | item in there, then do it.
                        |---------------------------------------------------------- */
                        for (j = i + 1; j < items.length; j++) {
                            var gap = tableau_item.cols[colIdx + 1] - tableau_item.cols[colIdx];
                            var gapAbs = gap > 0 ? gap : -gap;
                            var jItem = items[j];
                            var jItemIsWide = tableau_num_cols > 1 ? hasClass(jItem, 'wide') : false;

                            if (!jItemIsWide) {
                                jItem.style.width = w_col_perc + '%';
                                var jItemHeight = getItemHeight(jItem, jItemIsWide, w_col);

                                if (jItemHeight < gapAbs * 1.5) {
                                    items.splice(j, 1);
                                    j--;
                                    
                                    var gapColIdx = gap > 0 ? colIdx : colIdx + 1;

                                    jItem.style.top = tableau_item.cols[gapColIdx] + 'px';
                                    jItem.style.left = gapColIdx * (100 / tableau_num_cols) + '%';
                                    
                                    tableau_item.cols[gapColIdx] += jItemHeight;
                                    minY = tableau_item.cols_real[colIdx] > tableau_item.cols_real[colIdx + 1] ? tableau_item.cols_real[colIdx] : tableau_item.cols_real[colIdx + 1];
                                } else {
                                    break;
                                }
                            }
                        }   
                    }

                    /*-----------------------------------------------------------
                    | Add item to column array.
                    |----------------------------------------------------------*/
                    tableau_item.cols_items[colIdx].push(item);

                    var calculationHeight = itemHeight;
                    if (tableau_num_cols > colSpan && !isEmpty(item.getAttribute('tin-grid-solo'))) {
                        calculationHeight = Number.MAX_VALUE;
                    }
                    
                    for (j = 0; j < colSpan; j++) {
                        tableau_item.cols[colIdx + j] = minY + calculationHeight;
                        tableau_item.cols_real[colIdx + j] = minY + itemHeight;
                    }

                    item.style.top = minY + 'px';
                    item.style.left = colIdx * (100 / tableau_num_cols) + '%';
                    
                    /* -----------------------------------------------------------
                    | Keep track of the total tableau width, so we can center
                    | the tableau if needed.
                    |---------------------------------------------------------- */
                    if (colIdx + colSpan > maxIdx) {
                        maxIdx = colIdx + colSpan;
                    }

                    /* -----------------------------------------------------------
                    | Normalize columns.
                    |---------------------------------------------------------- */
                    if (normalizationThreshold) {
                        /* -----------------------------------------------------------
                        | Align current column with bottom of other.
                        |---------------------------------------------------------- */
                        var normalizedY = tableau_item.cols[colIdx];
                        for (j = 0; j < tableau_num_cols; j++) {
                            if (!(j < colIdx || j > colIdx + colSpan - 1)) {
                                continue;
                            }

                            if (tableau_item.cols[j] > tableau_item.cols[colIdx] && tableau_item.cols[j] - tableau_item.cols[colIdx] < normalizationThreshold) {
                                if (tableau_item.cols[j] > normalizedY) {
                                    normalizedY = tableau_item.cols[j];
                                }
                            }
                        }
                        for (j = 0; j < colSpan; j++) {
                            tableau_item.cols[colIdx + j] = normalizedY;
                            tableau_item.cols_real[colIdx + j] = normalizedY;
                        }

                        /* -----------------------------------------------------------
                        | Top align other columns with current one.
                        |---------------------------------------------------------- */
                        for (j = 0; j < tableau_num_cols; j++) {
                            if (!(j < colIdx || j > colIdx + colSpan - 1)) {
                                continue;
                            }

                            if (tableau_item.cols[j] < minY && minY - tableau_item.cols[j] < normalizationThreshold) {
                                tableau_item.cols[j] = minY;
                                tableau_item.cols_real[j] = minY;
                            }
                        }

                        /* -----------------------------------------------------------
                        | Bottom align columns.
                        |---------------------------------------------------------- */
                        for (j = 0; j < tableau_num_cols; j++) {
                            for (k = 0; k < tableau_num_cols; k++) {
                                if (j === k) {
                                    continue;
                                }

                                /* -----------------------------------------------------------
                                | Skip columns to the right of currently handled.
                                |---------------------------------------------------------- */
                                if (k > j) {
                                    continue;
                                }

                                var jCol = tableau_item.cols[j];
                                var kCol = tableau_item.cols[k];
                                
                                if (kCol < jCol && jCol - kCol < normalizationThreshold) {
                                    tableau_item.cols[k] = jCol;
                                    tableau_item.cols_real[k] = jCol;
                                }
                            }
                        }
                    }
                }

                /*-----------------------------------------------------------
                | Set classes on first / last items in columns.
                |----------------------------------------------------------*/
                for (i = 0; i < tableau_num_cols; i++) {
                    var len = tableau_item.cols_items[i].length;
                    for (j = 0; j < len; j++) {
                        if (j === 0) {
                            addClass(tableau_item.cols_items[i][j], 'tin-grid-first');
                        } else {
                            removeClass(tableau_item.cols_items[i][j], 'tin-grid-first');
                        }
                        if (j === len - 1) {
                            addClass(tableau_item.cols_items[i][j], 'tin-grid-last');
                        } else {
                            removeClass(tableau_item.cols_items[i][j], 'tin-grid-last');
                        }
                    }
                }
                
                /*-----------------------------------------------------------
                | Update the tableau height.
                |----------------------------------------------------------*/
                var maxY = 0;
                for (i = 0; i < tableau_num_cols; i++) {
                    if (tableau_item.cols_real[i] > maxY) {
                        maxY = tableau_item.cols_real[i];
                    }
                }
                tableau_item.ul.style.height = maxY+'px';
                
                // /**
                //  *  Center the tableau if needed.
                //  */
                // var diff = tableau_num_cols - maxIdx;
                // tableau_item.ul.style.left = 0.5*diff*(100/tableau_num_cols)+'%';
            }
        }

        function getItemHeight(item, itemIsWide, columnWidth) {
            var itemHeight = null;
            if (!isEmpty(item.getAttribute('data-ratio'))) {
                var ratioArr = item.getAttribute('data-ratio').split(':');
                if (ratioArr.length === 2) {
                    var ratio = ratioArr[1] / ratioArr[0];
                    if (!isNaN(ratio)) {
                        itemHeight = itemHeight = (columnWidth * (itemIsWide ? wideColSpan : 1)) * ratio;
                        item.style.height = itemHeight + 'px';
                    }
                }
            }
            else if (!isEmpty(item.getAttribute('data-height'))) {
                var dataHeight = parseInt(item.getAttribute('data-height'), 10);
                if (!isNaN(dataHeight)) {
                    itemHeight = dataHeight;
                    item.style.height = itemHeight + 'px';
                }
            }
            if (itemHeight === null) {
                if (settings.itemHeightType === 'auto') {
                    itemHeight = item.offsetHeight;
                }
                else if (settings.itemHeightType === 'fixed') {
                    itemHeight = itemIsWide ? settings.wideItemHeight : settings.itemHeight
                    item.style.height = itemHeight + 'px';
                }
                else if (settings.itemHeightType === 'ratio') {
                    itemHeight = (columnWidth * (itemIsWide ? wideColSpan : 1)) * (itemIsWide ? settings.wideItemHeight : settings.itemHeight);
                    item.style.height = itemHeight + 'px';
                }
            }
            return itemHeight;
        }

        /*----------------------------------------------------
        | Grid has been sorted, so items need new positions.
        |---------------------------------------------------*/
        function tableau_sorted() {

            var i, n, tableau_item, items, ul_li, li, item, len;

            /*----------------------------------------------------
            | Iterate tableaus.
            |---------------------------------------------------*/
            for (n = 0; n < tableau_data.length; n++) {
                tableau_item = tableau_data[n];
                items = [];
                ul_li = tableau_item.ul.children;
                for (i = 0; i < ul_li.length; i++) {
                    items.push(ul_li[i]);
                }
                tableau_item.items = items;
            }
        }

        return {
            add: tableau_add,
            remove: tableau_remove,
            removeAll: tableau_remove_all,
            update: tableau_update,
            sorted: tableau_sorted
        };
    }

    return TinGrid$;
})));
