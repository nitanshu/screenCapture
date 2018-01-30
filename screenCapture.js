// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;
(function ($, window, document, undefined) {

    'use strict';
    $('head').append('<link rel="stylesheet" href="screenCapture.css" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" type="text/css" />');

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variables rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).


    // Create the defaults once
    var pluginName = 'screenCapture',
        defaults = {
            wait: 5,
            api_url: 'http://115.113.189.10:3000/screen_captures',
            service_url: window.location.href,
            ajaxSettings: {
                async: false,
                global: false
            }
        };

    // The actual plugin constructor
    function screenCapture(element, options) {
        this.element = element;
        this.options = options;

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(screenCapture.prototype, {
        init: function () {

            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like the example below
            this.insertButton(this.element, this.settings);
        },
        insertButton: function (element, settings) {
            var parent_element = $('.' + element.className);
            var screen_capture_button = document.createElement('button');
            screen_capture_button.type = 'submit';
            screen_capture_button.value = 'screen_capture';
            screen_capture_button.name = 'screen_capture';
            screen_capture_button.innerHTML = '<i class="fa fa-camera" aria-hidden="true"></i>';
            screen_capture_button.className = 'screen_capture';
            parent_element.append(screen_capture_button);
            $('.' + screen_capture_button.className).on('click', function (e) {
                screenCapture.prototype.insertLoader(element, settings, this);
                screenCapture.prototype.captureScreenShot(element, settings, this);
            });
        },
        captureScreenShot: function (element, settings, screen_capture_button) {
            $.ajax({
                url: settings.api_url,
                type: "POST",
                data: {screen_capture: {service_url: settings.service_url}},
                success: function (data) {
                    screenCapture.prototype.showScreenShot(element, settings, data);
                    screenCapture.prototype.removeLoader(element, settings, screen_capture_button);
                }
            });
        },
        insertLoader: function(element, settings, screen_capture_button){
            $(screen_capture_button).html('<img src="ajax-loader.gif" class="loader">')
        },
        removeLoader: function(element, settings, screen_capture_button){
            $(screen_capture_button).html('<i class="fa fa-camera" aria-hidden="true"></i>')
        },
        showScreenShot: function (element, settings, data) {
            $('.' + element.className).append('<div class="captured_image_container"><img class="captured_image" src="http://' + data.img_url + '" /></div>');
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" +
                    pluginName, new screenCapture(this, options));
            }

        });
    };
    $(function () {
        $('body').append('<div class="screen_capture_container"></div>');
        $('.screen_capture_container').screenCapture();
    });


})(jQuery, window, document);