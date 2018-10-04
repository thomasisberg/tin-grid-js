/*!
 * TinGrid v0.1.11
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
    function isEmpty(value) {
        return value === undefined || value === null || value === '';
    }
    function isTrue(value) {
        return value === true || value === 'true' || value === 1 || value === '1';
    }
    function isObject(value) {
        return typeof value === 'object' && value !== null;
    }
    function hasClass(element, className) {
        if(typeof element.className !== 'string') {
            return false;
        }
        return element.className.split(" ").indexOf(className) >= 0;
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
            itemHeightType: "auto",  // "auto", "fixed" or "ratio".
            itemHeight: null,        // Number (pixels) for itemHeightType "fixed", Number (width / height) for itemHeightType "ratio".
            wideItemHeight: null,     // Height of wide item. Otherwise same as itemHeight. Falls back to itemHeight if necessary.
            useTransition: false,    // If itemHeightType is "auto", the width and height of the items will not be animated.
            transitionTime: "400ms", // Transition time.
            transitionEasing: "cubic-bezier(.48,.01,.21,1)", // Transition easing equation.
            minOffsetYNextColumn: 0 // How much higher up must the next column place item to be selected in favout of previous column.
        }
        if(isObject(options)) {
            for(var v in settings) {
                if(options[v] !== undefined) {
                    settings[v] = options[v];
                }
            }
        }
        if(settings.itemHeightType !== 'auto' && typeof settings.itemHeight !== 'number') {
            console.log("TinGrid: You must specify itemHeight as a Number.");
            return;
        }
        if(settings.wideItemHeight !== null && typeof settings.wideItemHeight !== 'number') {
            console.log("TinGrid: You must specify wideItemHeight as null or a Number");
            return;
        }
        if(settings.wideItemHeight === null) {
            settings.wideItemHeight = settings.itemHeight;
        }

        /*----------------------------------------------------
        | General variables.
        |---------------------------------------------------*/
        var tableau_num_cols;
        var tableau_timer = 0;
        var tableau_data = [];

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

        function tableau_add(tableau_element) {
            
            var i, j, x, n;

            var ul = tableau_element.querySelector('ul');
            
            /*----------------------------------------------------
            | Store items.
            |---------------------------------------------------*/
            var items = [];
            var ul_li = ul.children;
            for(i=0; i<ul_li.length; i++) {
                var li = ul_li[i];
                li.style.position = "absolute";
                if(settings.useTransition) {
                    var transition = "top "+settings.transitionTime+" "+settings.transitionEasing+", left "+settings.transitionTime+" "+settings.transitionEasing;
                    if(settings.itemHeightType !== "auto") {
                        transition += ", width "+settings.transitionTime+" "+settings.transitionEasing+", height "+settings.transitionTime+" "+settings.transitionEasing;
                    }
                    li.style.transition = transition;
                }
                items.push(li);
            }

            /*----------------------------------------------------
            | Optionally randomize items.
            |---------------------------------------------------*/
            if(isTrue(tableau_element.getAttribute('data-randomized'))) {
                function shuffle(o) { //v1.0
                    for(j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
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
                cols: null,
                cols_real: null
            });

            /*----------------------------------------------------
            | Update tableau on image load.
            |---------------------------------------------------*/
            var images = tableau_element.querySelectorAll('img');
            for(i=0, n=images.length; i<n; i++) {
                images[i].addEventListener('load', tableau_update);
            }
        }

        /*----------------------------------------------------
        | Update all tableaus registered by this instance.
        |---------------------------------------------------*/
        function tableau_update() {

            var w_win, i, n, tableau_item, item, items, len, maxIdx;
            
            clearTimeout(tableau_timer);
            tableau_timer = setTimeout(tableau_update, 3000);
            
            w_win = container.offsetWidth;

            /*----------------------------------------------------
            | Calculate number of columns for current width.
            |---------------------------------------------------*/
            tableau_num_cols = 1;
            for(i=0, n=settings.columnBreakpoints.length; i<n; i++) {
                if(w_win < settings.columnBreakpoints[i]) {
                    break;
                }
                tableau_num_cols++;
            }
            container.setAttribute('tin-grid-cols', tableau_num_cols);

            /*----------------------------------------------------
            | Current column width.
            |---------------------------------------------------*/
            var w_col_perc = 100 / tableau_num_cols;
            var w_col = Math.floor((1/tableau_num_cols)*w_win);
            
            /*----------------------------------------------------
            | Iterate tableaus.
            |---------------------------------------------------*/
            for(n=0; n<tableau_data.length; n++) {
                
                tableau_item = tableau_data[n];
                
                /*----------------------------------------------------
                | Reset columns.
                |---------------------------------------------------*/
                tableau_item.cols = [];
                tableau_item.cols_real = [];
                for(i=0; i<tableau_num_cols; i++) {
                    tableau_item.cols[i] = 0;
                    tableau_item.cols_real[i] = 0;
                }
                
                /*----------------------------------------------------
                | Create array of items.
                | Filtering should be done here.
                |---------------------------------------------------*/
                items = [];
                for(i=0, len=tableau_item.items.length; i<len; i++) {
                    item = tableau_item.items[i];
                    if(item.className.split(' ').indexOf('off') === -1) {
                        items.push(item);
                    }
                }

                /*----------------------------------------------------
                | Sort array if sorting seems to be defined.
                |---------------------------------------------------*/
                if(items.length && !isEmpty(items[0].getAttribute('tin-grid-sort'))) {
                    items.sort(function(a, b) {
                        return parseInt(a.getAttribute('tin-grid-sort'), 10) - parseInt(b.getAttribute('tin-grid-sort'), 10);
                    });
                }
                
                maxIdx = 0;
                
                /*----------------------------------------------------
                | Go through relevant items.
                |---------------------------------------------------*/
                for(i=0; i<items.length; i++) {
                    item = items[i];
                    var itemIsWide = tableau_num_cols > 1 ? hasClass(item, "wide") : false;

                    /*----------------------------------------------------
                    | Set item width and possibly height,
                    | depending on itemHeightType setting.
                    |---------------------------------------------------*/
                    item.style.width = (w_col_perc*(itemIsWide&&tableau_num_cols>1?2:1)) + "%";
                    var itemHeight = getItemHeight(item, itemIsWide, w_col);

                    /*----------------------------------------------------
                    | Place the item in column.
                    | 1. Check if there is a gap somewhere that is big enough.
                    | 2. Make sure wide items don't get placed at last column. Preferrably alter between pulling back a column and pushing to first column.
                    | 3. Store/update gaps.
                    |---------------------------------------------------*/
                    
                    var colIdx = 0;
                    var minY = Number.MAX_VALUE;
                    for(var j=0; j<tableau_num_cols-(itemIsWide&&tableau_num_cols>1?1:0); j++) {
                        var colY = tableau_item.cols[j];
                        if(itemIsWide && tableau_num_cols>1) {
                            if(tableau_item.cols[j+1] > colY) colY = tableau_item.cols[j+1];
                        }
                        if(colY < minY - settings.minOffsetYNextColumn) {
                            colIdx = j;
                            minY = colY;
                        }
                    }

                    /*----------------------------------------------------
                    | If the item had a preferred position.
                    |---------------------------------------------------*/
                    if(!isEmpty(item.getAttribute('tin-grid-position'))) {
                        var position = item.getAttribute('tin-grid-position');
                        if(position === 'left') {
                            colIdx = 0;
                        }
                        else if(position === 'center') {
                            colIdx = Math.floor((tableau_num_cols-1-(itemIsWide?1:0)) / 2)
                        }
                        else if(position === 'right') {
                            colIdx = tableau_num_cols-1-(itemIsWide?1:0);
                        }
                    }

                    /*----------------------------------------------------
                    | Handle gaps.
                    |---------------------------------------------------*/
                    if(itemIsWide && tableau_num_cols>1) {
                    
                        /**
                         *  If the gap gets smaller by putting the next single column item in there, then do it.
                         */
                        for(var j=i+1; j<items.length; j++) {
                            var gap = tableau_item.cols[colIdx+1] - tableau_item.cols[colIdx];
                            var gapAbs = gap > 0 ? gap : -gap;
                            var jItem = items[j];

                            var jItemIsWide = tableau_num_cols > 1 ? hasClass(jItem, "wide") : false;

                            if(!jItemIsWide) {
                                jItem.style.width = (w_col_perc*(jItemIsWide?2:1)) + "%";
                                var jItemHeight = getItemHeight(jItem, jItemIsWide, w_col);

                                if(jItemHeight < gapAbs * 1.5) {
                                    
                                    items.splice(j, 1);
                                    j--;
                                    
                                    var gapColIdx = gap > 0 ? colIdx : colIdx+1;

                                    jItem.style.top = tableau_item.cols[gapColIdx]+"px";
                                    jItem.style.left = gapColIdx*(100/tableau_num_cols)+"%";
                                    
                                    tableau_item.cols[gapColIdx] += jItemHeight;
                                    minY = tableau_item.cols_real[colIdx] > tableau_item.cols_real[colIdx+1] ? tableau_item.cols_real[colIdx] : tableau_item.cols_real[colIdx+1];
                                    
                                } else {
                                    
                                    break;
                                    
                                }
                            }
                        }   
                    }

                    var calculationHeight = itemHeight;
                    if(tableau_num_cols > 2 && !isEmpty(item.getAttribute('tin-grid-solo'))) {
                        calculationHeight = Number.MAX_VALUE;
                    }

                    tableau_item.cols[colIdx] = minY + calculationHeight;
                    tableau_item.cols_real[colIdx] = minY + itemHeight;
                    if(itemIsWide) {
                        tableau_item.cols[colIdx+1] = minY + calculationHeight;
                        tableau_item.cols_real[colIdx+1] = minY + itemHeight;
                    }

                    item.style.top = minY+"px";
                    item.style.left = colIdx*(100/tableau_num_cols)+"%";
                    
                    /**
                     *  Keep track of the total tableau width, so we can center the tableau if needed.
                     */
                    if(colIdx+(tableau_num_cols>1&&itemIsWide?2:1) > maxIdx) maxIdx = colIdx+(tableau_num_cols>1&&itemIsWide?2:1);
                    
                }
                
                /**
                 *  Update the tableau height.
                 */
                var maxY = 0;
                for(var i=0; i<tableau_num_cols; i++) {
                    if(tableau_item.cols_real[i] > maxY) maxY = tableau_item.cols_real[i];
                }

                tableau_item.ul.style.height = maxY+"px";
                
                // /**
                //  *  Center the tablueau if needed.
                //  */
                // var diff = tableau_num_cols - maxIdx;
                // tableau_item.ul.style.left = 0.5*diff*(100/tableau_num_cols)+"%";
            }
        }

        function getItemHeight(item, itemIsWide, columnWidth) {
            var itemHeight = null;
            if(!isEmpty(item.getAttribute("data-ratio"))) {
                var ratioArr = item.getAttribute("data-ratio").split(":");
                if(ratioArr.length === 2) {
                    var ratio = ratioArr[1] / ratioArr[0];
                    if(!isNaN(ratio)) {
                        itemHeight = itemHeight = (columnWidth*(itemIsWide?2:1)) * ratio;
                        item.style.height = itemHeight + "px";
                    }
                }
            }
            else if(!isEmpty(item.getAttribute("data-height"))) {
                var dataHeight = parseInt(item.getAttribute("data-height"), 10);
                if(!isNaN(dataHeight)) {
                    itemHeight = dataHeight;
                    item.style.height = itemHeight + "px";
                }
            }
            if(itemHeight === null) {
                if(settings.itemHeightType === "auto") {
                    itemHeight = item.offsetHeight;
                }
                else if(settings.itemHeightType === "fixed") {
                    itemHeight = itemIsWide ? settings.wideItemHeight : settings.itemHeight
                    item.style.height = itemHeight + "px";
                }
                else if(settings.itemHeightType === "ratio") {
                    itemHeight = (columnWidth*(itemIsWide?2:1)) * (itemIsWide ? settings.wideItemHeight : settings.itemHeight);
                    item.style.height = itemHeight + "px";
                }
            }
            return itemHeight;
        }

        /*----------------------------------------------------
        | Grid haas been sorted, so items need new positions.
        |---------------------------------------------------*/
        function tableau_sorted() {

            var i, n, tableau_item, items, ul_li, li, item, len;

            /*----------------------------------------------------
            | Iterate tableaus.
            |---------------------------------------------------*/
            for(n=0; n<tableau_data.length; n++) {
                tableau_item = tableau_data[n];
                items = [];
                ul_li = tableau_item.ul.children;
                for(i=0; i<ul_li.length; i++) {
                    items.push(ul_li[i]);
                }
                tableau_item.items = items;
            }
        }

        return {
            update: tableau_update,
            sorted: tableau_sorted
        };
    }

    return TinGrid$;

})));

