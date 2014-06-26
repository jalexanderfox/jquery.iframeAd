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
;(function ( $, window, document, undefined ) {

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

    Plugin.prototype.loadIframeAd = function() {

        var options             = this.options;
        var iframeAdPlaceholder = this.element;
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


        var iframe_style = 'border:none;';

        var iframe_attr = {
            //id: 'my_iframe',
            //name:'my_iframe',
            src: 'about:blank',
            width: width,
            height: height,
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

        var _isFlexAd = function() {
            return options.display && options.display === 'flex';
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
        var _findDimension = function(dimension, content_dim) {
            // var y_list = [0, 25, 30, 45, 60, 90, 60, 100, 130, 150, 200, 220, 240, 249, 250, 280, 600];
            // var x_list = [0, 100, 120, 160, 150, 195, 200, 300, 336, 468, 655, 728, 1000];
            // getting real about this, let'
            var y_list = [50, 250, 600];
            var x_list = [160, 300];

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
            //console.log(iframe_content.document.body.offsetHeight);
            //console.log(iframe_content.document.body.offsetWidth);
            var iframe_content_width  = _findDimension('width', iframe_content.document.body.offsetWidth);
            var iframe_content_height = _findDimension('height', iframe_content.document.body.offsetHeight);
            var width                 = (iframe_content_width > max_width) ? max_width : iframe_content_width;
            var height                = (iframe_content_height > max_height) ? max_height : iframe_content_height;
            iframe.height = height;
            iframe.width  = width;
            // Allowing for the container with label to be set based on its inner content and outer container
            // iframe_wrap.style.height = height + 'px';
            // iframe_wrap.style.width  = width + 'px';

            //_onScreen( iframe_wrap );
            _labelOn();

            //console.log(iframe.name + ' = loaded - width = ' + width + ' height = ' + height);
        };

        var _getHTML = function() {

            if(options.fn && typeof(options.fn)){
                content = options.fn(options.args);
            }

            var css  = '<style>*{padding:0;margin:0;}html,body{overflow:hidden;}<\/style>';
            var head = '<head>'+css+'</head>';
            var body = '<body>'+content+'</body>';
            var html = '<!DOCTYPE html>'+head+body+'</html>';
            return html;
        };

        // polling the height seems to be the most accurate way to get the height of the iframe, at this point.
        var _pollHeight = function() {
            //console.log('polling...');
            var height     = 0;
            var time       = 66;
            var max_cycles = 106; //106@66ms approx 7 seconds. for the ad to load before we call it quits on trying to resize the iframe.
            var cycles     = 0;
            var pollingComplete =
                function(){
                    _resizeIframe();
                    clearInterval(interval);
                };
            var interval  =
            setInterval(
                function(){
                    var content_height = iframe_content.document.body.offsetHeight;
                    //console.log('content_height = ' + content_height);
                    if( cycles === max_cycles ) {
                        pollingComplete();
                    }

                    if( content_height !== 0 ) {
                        if( height !== content_height ) {
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

        // if multiple calls are made on the same element...
        if (iframe_content === null) {
            return;
        }

        // if this is a flex ad, setup the on load event handler so we can adjust the height on load
        if(_isFlexAd()) {
            //addEvent(iframe_content, 'load', function(){
            $(iframe).on('load', function(){
                //_resizeIframe();
                _pollHeight();
            });

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



})( jQuery, window, document );



