/*!
 * TinGrid v0.1.1
 * (c) 2018 Thomas Isberg
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.TinGrid = factory());
}(this, (function () {

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

    function TinGrid$(container, options) {

        var settings = {
            itemHeightType: "auto",  // "auto", "fixed" or "ratio".
            itemHeight: null,        // Number (pixels) for itemHeightType "fixed", Number (width / height) for itemHeightType "ratio".
            wideItemHeight: null,     // Height of wide item. Otherwise same as itemHeight. Falls back to itemHeight if necessary.
            useTransition: false,    // Will probably not work too well with itemHeightType "auto".
            transitionTime: "400ms", // Transition time.
            transitionEasing: "cubic-bezier(.48,.01,.21,1)" // Transition easing equation.
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

        var tableau_num_cols;
        var tableau_timer = 0;
        var tableau_data = [];

        tableau_add(container);
        if(tableau_data.length) {
            tableau_update();
            window.addEventListener('resize', tableau_update);
        }

        function tableau_add(tableau_element) {
            
            var i, j, x;

            var ul = tableau_element.querySelector('ul');
            
            /**
             *  Randomize and store items.
             */
            var items = [];
            var ul_li = ul.children;
            for(i=0; i<ul_li.length; i++) {
                var li = ul_li[i];
                li.style.position = "absolute";
                if(settings.useTransition) {
                    li.style.transition = "top "+settings.transitionTime+" "+settings.transitionEasing+", left "+settings.transitionTime+" "+settings.transitionEasing+", width "+settings.transitionTime+" "+settings.transitionEasing+", height "+settings.transitionTime+" "+settings.transitionEasing;
                }
                items.push(li);
            }

            if(isTrue(tableau_element.getAttribute('data-randomized'))) {
                function shuffle(o) { //v1.0
                    for(j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                    return o;
                };
                items = shuffle(items);
            }
            
            tableau_data.push({
                "tableau": tableau_element,
                "ul": ul,
                "items": items,
                "cols": null
            });
        }

        function tableau_update() {

            var w_win, i, n, tableau_item, item, items, len, maxIdx;
            
            clearTimeout(tableau_timer);
            tableau_timer = setTimeout(tableau_update, 3000);
            
            w_win = container.offsetWidth;
            tableau_num_cols = 1;
            if(w_win < 470) tableau_num_cols = 1;
            else if(w_win < 660) tableau_num_cols = 2;
            else if(w_win < 930) tableau_num_cols = 3;
            else if(w_win < 1200) tableau_num_cols = 4;
            else if(w_win < 1560) tableau_num_cols = 5;
            else if(w_win < 1880) tableau_num_cols = 6;
            else tableau_num_cols = 7;

            var w_col_perc = 100 / tableau_num_cols;
            var w_col = Math.floor((1/tableau_num_cols)*w_win);
            
            for(n=0; n<tableau_data.length; n++) {
                
                tableau_item = tableau_data[n];
                
                /**
                 *  Reset columns.
                 */
                tableau_item.cols = [];
                for(i=0; i<tableau_num_cols; i++) {
                    tableau_item.cols[i] = 0;
                }
                
                items = [];
                len = tableau_item.items.length;	
                for(i=0; i<len; i++) {
                    
                    item = tableau_item.items[i];
                    items.push(item);
                    
                }
                
                maxIdx = 0;
                
                /**
                 *  Go through items.
                 */
                for(i=0; i<items.length; i++) {

                    item = items[i];

                    var itemIsWide = hasClass(item, "wide");
                    item.style.width = (w_col_perc*(itemIsWide?2:1)) + "%";
                    
                    /**
                     *  Place the item in column.
                     *  1. Check if there is a gap somewhere that is big enough.
                     *  2. Make sure wide items don't get placed at last column. Preferrably alter between pulling back a column and pushing to first column.
                     *  3. Store/update gaps.
                     */

                    var itemHeight = getItemHeight(item, itemIsWide, w_col);
                    
                    var colIdx = 0;
                    var minY = Number.MAX_VALUE;
                    for(var j=0; j<tableau_num_cols-(itemIsWide&&tableau_num_cols>1?1:0); j++) {
                        var colY = tableau_item.cols[j];
                        if(itemIsWide && tableau_num_cols>1) {
                            if(tableau_item.cols[j+1] > colY) colY = tableau_item.cols[j+1];
                        }
                        if(colY < minY) {
                            colIdx = j;
                            minY = colY;
                        }
                    }

                    /**
                     *  Handle gaps.
                     */
                    if(itemIsWide && tableau_num_cols>1) {
                    
                        /**
                         *  If the gap gets smaller by putting the next single column item in there, then do it.
                         */
                        for(var j=i+1; j<items.length; j++) {
                            var gap = tableau_item.cols[colIdx+1] - tableau_item.cols[colIdx];
                            var gapAbs = gap > 0 ? gap : -gap;
                            var jItem = items[j];

                            var jItemIsWide = hasClass(jItem, "wide");

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
                                    minY = tableau_item.cols[colIdx] > tableau_item.cols[colIdx+1] ? tableau_item.cols[colIdx] : tableau_item.cols[colIdx+1];
                                    
                                } else {
                                    
                                    break;
                                    
                                }
                            }
                        }
                        
                    }
                    
                    tableau_item.cols[colIdx] = minY + itemHeight;
                    if(itemIsWide) {
                        tableau_item.cols[colIdx+1] = minY + itemHeight;
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
                    if(tableau_item.cols[i] > maxY) maxY = tableau_item.cols[i];
                }

                tableau_item.ul.style.height = maxY+"px";
                
                /**
                 *  Center the tablueau if needed.
                 */
                var diff = tableau_num_cols - maxIdx;
                tableau_item.ul.style.left = 0.5*diff*(100/tableau_num_cols)+"%";
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

    }

    return TinGrid$;

})));

