/*!
 * jQuery.iframeAd
 * Author: @jalexanderfox
 * Licensed under the MIT license
 */

/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani & @jalexanderfox
 * Licensed under the MIT license
 */


// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ( $, window, document, debug, undefined ) {

    // undefined is used here as the undefined global
    // variable in ECMAScript 3 and is mutable (i.e. it can
    // be changed by someone else). undefined isn't really
    // being passed in so we can ensure that its value is
    // truly undefined. In ES5, undefined can no longer be
    // modified.

    // window and document are passed through as local
    // variables rather than as globals, because this (slightly)
    // quickens the resolution process and can be more
    // efficiently minified (especially when both are
    // regularly referenced in our plugin).

    // Create the defaults once
    var pluginName = "iframeAd",
        defaults = {
             "width":"300" // width of the iframe
            ,"height":"250"// height of the iframe, for auto iframe sizing, use option below display:flex
            ,'content':'' // simplay place content inside the iframe
            ,'fn': null // a function to call instead of placing content
            ,'args': {} // arguments to pass to the function 'fn'
            ,'display':null // 'flex' : should the iframe resize based on it's content?
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this._defaults = defaults;
        this._name = pluginName;
        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options);

        this.init();
    };

    Plugin.prototype.debug = function(bugger) {
        if ( this.options.debug === true || debug === true ) {
            if (bugger === undefined) {
                // DEBUG
                console.log(this.element);
                console.log(this.options);
                // DEBUG
            } else {
                console.log(bugger);
            }

        }
    };

    Plugin.prototype.log = Plugin.prototype.debug;

    Plugin.prototype.updateOptions = function( options ) {
        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend( this.options, options );
    };

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // We already have access to the DOM element and
        // the options via the instance, e.g. this.element
        // and this.options
        //$(this.element).html(this.options.content);
        //
        //

        this.refreshIframeAd();
    };



    //http://stackoverflow.com/questions/5574842/best-way-to-check-for-ie-less-than-9-in-javascript-without-library
    //https://gist.github.com/padolsey/527683
    var ie = (function(){

        var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');

        while (
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
        );

        return v > 4 ? v : undef;
    }());

    // var randomString = function(length, chars) {
    //     var mask = '';
    //     if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    //     if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    //     if (chars.indexOf('#') > -1) mask += '0123456789';
    //     if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    //     var result = '';
    //     for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    //     return result;
    // };

    Plugin.prototype.loadIframeAd = function() {

        var that                = this;
        var options             = this.options;
        var iframeAdPlaceholder = this.element;
	//iframeAdPlaceholder.id  = iframeAdPlaceholder.id || randomString(16, 'aA'); //if placeholder doesn't have an id, give it a randome one
        var id                  = iframeAdPlaceholder.id;
        var content             = options.content;

        var iframe = document.createElement('iframe');
            iframe.id        = 'Ad-iframe--' + id;
            iframe.name      = 'Ad-iframe--' + id;
            iframe.className = 'Ad-iframe ' + iframe.name;

        var width      = options.width;
        var height     = options.height;
        var max_width  = width;
        var max_height = height;

	var _isFlexAd = function() {
	    return options.display && options.display === 'flex';
	};

        var iframe_style = 'border:none;';

        var iframe_attr = {
            //id: 'my_iframe',
            //name:'my_iframe',
            src: 'about:blank',
	    width: _isFlexAd() ? '' : width,
	    height: _isFlexAd() ? '' : height,
            scrolling: 'no',
            marginWidth:0,
            marginHeight:0,
            noResize: 0,
            border: 0,
            frameBorder:0,
            frameSpacing:0,
            background: 'transparent',
            allowTransparency: 'allowTransparency',
            style:iframe_style
        };

        for (var i in iframe_attr) {
          iframe.setAttribute(i, iframe_attr[i]);
        }


        var iframe_wrap = document.createElement('div');
            //iframe_wrap.className = css_invisible_class + ' Ad-IframeWrap Ad-IframeWrap--' + id;
            iframe_wrap.className =  ' Ad-IframeWrap Ad-IframeWrap--' + id;

        iframe_wrap.appendChild(iframe);

        if ( iframeAdPlaceholder.hasChildNodes() ) {
          iframeAdPlaceholder.replaceChild(iframe_wrap, iframeAdPlaceholder.firstChild);
        } else {
          iframeAdPlaceholder.appendChild(iframe_wrap);
        }

        // turn on and off the "ADVERTISEMENT" label
        var _labelOn = function() {
            $(iframe_wrap).removeClass('is-labelOff');
        };

        var _labelOff = function() {
            $(iframe_wrap).addClass('is-labelOff');
        };

        if(_isFlexAd()) {
            // hide until we know the dimensions of the ad
            //_offScreen( iframe_wrap );
            _labelOff();
        }

        var iframe_content = iframe.contentWindow || iframe.contentDocument;


        // because the child window cannot be trusted for getting a 100% accurate height
        // we must check the child provided height against a list of known heights and
        // set the parent iframe height to a known ad height.
        var _findAdDimension = function(dimension, content_dim) {
            // var y_list = [0, 25, 30, 45, 60, 90, 60, 100, 130, 150, 200, 220, 240, 249, 250, 280, 600];
            // var x_list = [0, 100, 120, 160, 150, 195, 200, 300, 336, 468, 655, 728, 1000];
            // getting real about this, let'
            var y_list = [50, 250, 600, 1050]; // 1050 for aol devil ad support
            var x_list = [160, 300, 320];

            var d_list = (dimension==='height')?y_list:x_list;
            var closest_dim = null;
            content_dim = parseInt(content_dim, 10);

            // find closest number in array
            for (var i = 0; i < d_list.length; i++) {
                if(closest_dim === null || Math.abs(d_list[i] - content_dim) < Math.abs(closest_dim - content_dim) ) {
                    closest_dim = d_list[i];
                }
            }
            return closest_dim;
        };


        var _resizeIframe = function() {
            var width = 0;
            var height = 0;

            height = iframe_content.document.body.offsetHeight;
            width  = iframe_content.document.body.offsetWidth;
            that.log('iframe_content.document.body.offsetWidth', iframe_content.document.body.offsetWidth);

            // if iframe dimensions are 0, the creative is likely absolute positioned and does not take up space in the flow
            // we still need to find the dimensions of the ad, so we serach for dimensions of a child elements in the iframe document
            if(height === 0 || width === 0) {
                height = _findGreatestChildDimension(iframe_wrap, 'outerHeight');
                width = _findGreatestChildDimension(iframe_wrap, 'outerWidth');
            }

            // from the demensions, find the ad specific dimensions (Snap to predefined ad dimensions)
            height = _findAdDimension('height', height);
            width  = _findAdDimension('width', width);

            // set the iframe dimensions
            iframe.height = height;
            iframe.width  = width;

            // set the iframe wrapper to the same dimensions
            $(iframe_wrap).css('height', height).css('width', width);

            // set the iframe placeholder height and width accordingly
	    $(iframeAdPlaceholder).css('height', height).css('width', width);


            //_onScreen( iframe_wrap );
            _labelOn();

            //that.log(iframe.name + ' = loaded - width = ' + width + ' height = ' + height);
        };

        var _getHTML = function() {

            if(options.fn){
                if(options.fnContext) {
                    content = options.fn.call(options.fnContext, options.args);
                } else {
                    content = options.fn(options.args);
                }
            }

            var css  = '<style>*{padding:0;margin:0;}html,body{overflow:hidden;}<\/style>';
            var script = '<script>inDapIF = true;<\/script>';
            var head = '<head>'+css+script+'</head>';
            var body = '<body>'+content+'</body>';
            var html = '<!DOCTYPE html>'+head+body+'</html>';
            return html;
        };

        // polling the height seems to be the most accurate way to get the height of the iframe, at this point.
	// var _pollHeight = function() {
	//     //that.log('polling...');
	//     var height     = 0;
	//     var time       = 66;
	//     var max_cycles = 106; //106@66ms approx 7 seconds. for the ad to load before we call it quits on trying to resize the iframe.
	//     var cycles     = 0;
	//     var pollingComplete =
	//         function(){
	//             _resizeIframe();
	//             clearInterval(interval);
	//             jQuery.waypoints('refresh');
	//         };
	//     var interval  =
	//     setInterval(
	//         function(){
	//             var content_height = iframe_content.document.body.offsetHeight;
	//             //that.log('content_height = ' + content_height);
	//             if( cycles === max_cycles ) {
	//                 pollingComplete();
	//             }

	//             if( content_height !== 0 ) {
	//                 if( height !== content_height ) {
	//                     height = content_height;
	//                     max_cycles++;
	//                 } else {
	//                     pollingComplete();
	//                 }
	//             }

	//             cycles++;

	//         },
	//         time
	//     );
	// };

	// polling the height seems to be the most accurate way to get the height of the iframe, at this point.
	var _pollDimensions = function() {
            //that.log('polling...');
            var height     = 0;
	    var width      = 0;
	    var time       = 500;
	    var max_cycles = 12; //106@66ms approx 7 seconds. for the ad to load before we call it quits on trying to resize the iframe.
            var cycles     = 0;
            var pollingComplete =
                function(){
                    _resizeIframe();
                    clearInterval(interval);
                    jQuery.waypoints('refresh');
                };
            var interval  =
            setInterval(
                function(){
		    var content_height = _findGreatestChildDimension(iframe_wrap, 'outerHeight');
		    var content_width = _findGreatestChildDimension(iframe_wrap, 'outerWidth');
                    //that.log('content_height = ' + content_height);
                    if( cycles === max_cycles ) {
                        pollingComplete();
                    }

		    if( content_height !== 0 && content_width !== 0 ) {
			if( height !== content_height || width !== content_width ) {
			    width = content_width;
                            height = content_height;
                            max_cycles++;
                        } else {
                            pollingComplete();
                        }
                    }

                    cycles++;

                },
                time
            );
        };

        var _findGreatestChildDimension = function(element, dim) {
            var size = 0,
                elements = $(element).find("iframe, div");
            elements.each(function(){
                size = $(this)[dim]() > size ? $(this)[dim]() : size;
            });
            return size;
        };

        // if multiple calls are made on the same element...
        if (iframe_content === null) {
            return;
        }

        // if this is a flex ad, setup the on load event handler so we can adjust the height on load
        var _iframeLoadCallback = function(){
            _resizeIframe();
	    _pollDimensions();
            that.debug();
        };

        if(_isFlexAd()) {
            //addEvent(iframe_content, 'load', function(){
            //backwards capability with 1.4.4 (UCB)
            if(jQuery.fn.on) {
                $(iframe).on('load', _iframeLoadCallback);
            } else {
                $(iframe).load(_iframeLoadCallback);
            }
        }


        // Split solution:
        if(ie && ie<10){
            // using javascript URI scheme is the best way to acheive what we need for IE less than 10
            iframe_content.contents = _getHTML();
            iframe.src = 'javascript:window["contents"]';
        }
        else {
            // for modern browsers, we use the iframe api
            iframe_content.document.open();
            iframe_content.document.write(_getHTML());
            iframe_content.document.close();
        }

        // Mostly API solution:
        // iframe_content.document.open();
        // iframe_content.document.write(_getHTML());
        // if(ie && ie>9){
        //     iframe_content.document.close();
        // }

        that.debug();
        return iframe;
    };

    Plugin.prototype.refreshIframeAd = function() {
        var iframeAdPlaceholder = this.element;

        if ( iframeAdPlaceholder ) {
            $(iframeAdPlaceholder).addClass('is-ready');
            return this.loadIframeAd();
        }
    };

    // probably don't even need options
    Plugin.prototype.removeIframeAd = function () {
      var iframeAdPlaceholder = this.element;
      if ( iframeAdPlaceholder ) {
        $(iframeAdPlaceholder).removeClass('is-ready');
        iframeAdPlaceholder.innerHTML = "";
      }
    };


    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new Plugin( this, options ));
            }
        });
    };

    $.fn[pluginName+'Load'] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new Plugin( this, options ));
            } else {
                var self = $.data(this, "plugin_" + pluginName );
                self.updateOptions( options );
                self.refreshIframeAd();
            }
        });
    };

    $.fn[pluginName+'Unload'] = function () {
        return this.each(function () {
            if ( $.data(this, "plugin_" + pluginName )) {
                var self = $.data(this, "plugin_" + pluginName );
                self.removeIframeAd();
            }
        });
    };



})( jQuery, window, document, false ); // !!IMPOTANT don't forget to set this back to false before you commit!!
// turn on and off global debug with last value ( true | false )






