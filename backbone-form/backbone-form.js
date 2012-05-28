/*
 * Backbone-Form - Backbone form validator and ajax helper.
 *
 * This is a simple backbone form view for form validation
 * and ajax submit helper.
 *
 * Well integrated with django forms and django-superview
 * json output of form errors.
 *
 * Changelog:
 *  * 21-05-2012 - First public version. (0.1)
 *  * 22-05-2012 - Add global errors. (0.2)
 *               - Add higlight field.
 *  * 28-05-2012 - Add ie fixes. (0.3)
 *               - Add ie ajax upload files. (very experimental)
 *
 *
 * Author: Andrei Antoukh <andrei.antoukh@kaleidos.net>
 * License: BSD
 * Version: 0.2
*/

if (window.gettext === undefined) {
    window.gettext = function(data) { return data; }
}

var Form = Backbone.View.extend({
    /* CONSTRUCTOR
     * 
     * This method by default need one parameter: `el`.
     * Aditionally, you can pass others:
     *
     *   `errors`
     *
     *      aditional errors messages.
     *
     *  `clearOnInit`
     *
     *      with this parameter to true, on create a form view instance
     *      clears all error list.
     *
     *  `resetOnInit`
     *      
     *      same as `clearOnInit` but reset form.
     *
     *  `fieldErrorsOnGlobalBox`
    */ 

    defaultHiglightClass: 'error-field',

    defaultFormErrors: {
        'required': gettext('This field is required.'),
        'maxlength': gettext('Field contents  exceeds the maximum size allowed.'),
        'minlength': gettext('The label is smaller than allowed.')
    },


    initialize: function() {
        _.bindAll(this, 'validate', 'clear', 'setErrors', 'collectData', 'submit',
                'reset', 'getXhr', 'fields', 'uploadProgress', 'ieSubmitFallback',
                'setErrorsFieldsStandatd', 'setErrorsFieldsOnGlobalBox', 'setErrorsGlobal');

        if (this.options.clearOnInit) {
            this.clear();
        }

        if (this.options.resetOnInit) {
            this.reset();
        }

        this.globalErrorsBox = null;
        this.errors = {}
        
        _.extend(this.errors, this.defaultFormErrors)
        if (this.options.errors == undefined) {
            _.extend(this.errors, this.options.errors);
        }
        
        if (this.options.higlight === undefined) {
            this.options.higlight = this.defaultHiglightClass;
        }
    },

    /* 
     * Remove all errors on form.
    */

    clear: function() {
        this.$("ul.errorlist").remove();

        if (this.globalErrorsBox) {
            this.globalErrorsBox.html("");
            this.globalErrorsBox.hide();
        }

        if (this.options.higlight) {
            this.$("." + this.options.higlight).removeClass(this.options.higlight);
        }
    },

    /*
     * Reset a form. Remove all assigned values.
    */

    reset: function() {
        this.$("input[type=text], input[type=file], select, textarea").val('');
    },

    /* PRIVATE METHOD
     *
     * creates a custom XMLHttpRequest builder
     * TODO:  make this compatible with IE
    */
    
    getXhr: function() {
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", this.uploadProgress);
        return xhr;
    },

    /* PRIVATE METHOD
     *
     * Calculate a percentage of form upload progress and trigger `progress` 
     * event with a current percentaje.
    */

    uploadProgress: function(evt) {
        if (evt.lengthComputable) {
            this.bytesUploaded = evt.loaded;
            this.bytesTotal = evt.total;
            this.trigger('progress', Math.round(evt.loaded * 100 / evt.total));
        }
    },

    ieSubmitFallback: function(opts) {
        var success = opts.success || null;
        var error = opts.error || null;

        var url = opts.url || this.$el.attr('action');
        var type = opts.type || this.$el.attr('type') || 'post';


        // Remove old iframe
        this.$el.parent().find("#upload_iframe").remove();
        
        // Create new iframe
        var iframe = document.createElement("iframe");
        iframe.setAttribute("id", "upload_iframe");
        iframe.setAttribute("name", "upload_iframe");
        iframe.setAttribute("width", "0");
        iframe.setAttribute("height", "0");
        iframe.setAttribute("border", "0");
        iframe.setAttribute("style", "width: 0; height: 0; border: none;");

        this.el.parentNode.appendChild(iframe);
        this.$el.attr('target', 'upload_iframe');

        var iframeId = document.getElementById("upload_iframe");
        
        var eventHandler = function () {
            var content = null;
            if (iframeId.detachEvent) iframeId.detachEvent("onload", eventHandler);
            else iframeId.removeEventListener("load", eventHandler, false);
 
            // Message from server...
            if (iframeId.contentDocument) {
                content = iframeId.contentDocument.body.innerText;
            } else if (iframeId.contentWindow) {
                content = iframeId.contentWindow.document.body.innerText;
            } else if (iframeId.document) {
                content = iframeId.document.body.innerText;
            }
            
            if (content.length > 0) {
                if (success !== null && success !== undefined) {
                    success(JSON.parse(content));
                }
            }
 
            // Del the iframe...
            setTimeout('iframeId.parentNode.removeChild(iframeId)', 250);
        }
 
        if (iframeId.addEventListener) iframeId.addEventListener("load", eventHandler, true);
        if (iframeId.attachEvent) iframeId.attachEvent("onload", eventHandler);

        this.el.submit();
    },

    /* submit(opts):  Makes ajax submit of the asociated form
     * 
     * Posible params:
     *
     *   `success`:  
     *      
     *      this is a success callback, receives a response.  If this parameter 
     *      is undefined, fallback to use self implemented success method.
     *
     *   `error`
     *      
     *      same as `success` but for error.
     *
     *   `dataType`
     *      
     *      this is a jquery `dataType` parameter, by default is set to `json`.
     *
     *   `url`
     *      
     *      url to send a form data, by default is a form action.
     *
     *   `type` 
     *
     *      is a request type, by default, uses form type attribute.
     *
     *   `jqueryOpts`
     *
     *      with this parameter you can pass all jquery parametes ($.ajax()).
    */

    submit: function(opts) {
        if (opts === undefined) {
            opts = {};
        }

        var has_files = false;
        var is_ie = false;

        if (this.$("input[type=file]").length > 0) {
            has_files = true;
        }
        
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            is_ie = true;

            if (has_files) {
                return this.ieSubmitFallback(opts);
            }
        }

        var success = opts.success || null;
        var error = opts.error || null;

        var url = opts.url || this.$el.attr('action');
        var type = opts.type || this.$el.attr('type') || 'post';
        var dataType = opts.dataType || 'json';
        var enctype = opts.enctype || this.$el.attr('enctype') || false;
        var jquery_lowlevel_opts = opts.jqueryOpts || {};

        var ajax_params = {
            url: url,
            type: type,
            dataType: dataType
        };

        if (success !== null) _.extend(ajax_params, {success:success});
        if (error !== null) _.extend(ajax_params, {error:error});
        if (!is_ie) _.extend(ajax_params, {xhr: this.getXhr});

        _.extend(ajax_params, jquery_lowlevel_opts);

        if (opts.data !== undefined) {
            ajax_params['data'] = opts.data;
        } else {
            ajax_params['data'] = this.collectData();
        }
        
        if (enctype && enctype == 'multipart/form-data') {
            ajax_params['processData'] = false;
            ajax_params['contentType'] = false;
        }

        return $.ajax(ajax_params);
    },

    /* collectData(opts)
     *
     * Collects form data. If form has attribute 'enctype' and is equal to 'multipart/form-data'
     * this method return FormData instance. If this interface is not found or is a normal form,
     * this internally use jquery.serialize() method.
     *
     * Options:
     *
     *  `forceSerialize`
     *
     *      with this parameter force user of jquery serialize on case if a form is multipart.
    */
    
    collectData: function(opts) {
        if (opts === undefined) { opts = {}; }
        if (opts.forceSerialize === undefined) { opts.forceSerialize = false; }
        
        if (this.$el.attr('enctype') === 'multipart/form-data' && !opts.forceSerialize) {
            return new FormData(this.el);
        } else {
            return this.$el.serialize();
        }
    },
    
    /* PRIVATE METHOD
     *
     * Return all fields on current associated form.
    */

    fields: function() {
        var _fields = new Array();
        _.each(this.$("input, select, textarea"), function(item) {
            _fields.push( $(item) );
        });

        return _fields;
    },
    
    /*
     * Validate with javascript some fields
     *
     * TODO: NOT IMPLEMENTED, UNDER DEVELOPMENT.
    */

    validate: function() {
        var required_fields = _.filter(this.fields(), function(item) {
            return item.hasClass('required');
        });

        var errors = {};
        var has_errors = false;

        _.each(required_fields, function(item) {
            if (item.val() == "") {
                errors[item.attr('name')] = this.errors['required'];
                has_errors = true;
            }
        });
        
        if (has_errors) {
            this.setErrors(errors);
        }
        return has_errors;
    },

    searchField: function(key) {
        return this.$("[name='" + key + "']");
    },

    setGlobalErrorsBox: function(dom) {
        this.globalErrorsBox = $(dom);
    },

    setErrorsGlobal: function(errors) {
        var self = this;
        _.each(errors.global, function(item) {
            self.globalErrorsBox.append(self.make('li', {}, item));
        });
        this.globalErrorsBox.show();
    },

    setErrorsFieldsStandatd: function(errors) {
        var self = this;

        _.each(errors.form, function(error_list, key) {
            var field = self.searchField(key);
            self.higlight(field);
            var error_list_dom = $(self.make('ul', {'class': 'errorlist', 'id': 'field-' + field.attr('id')}));

            _.each(error_list, function(item) {
                error_list_dom.append(self.make('li', {}, item));
            });

            error_list_dom.insertBefore(field);
        });
    },

    setErrorsFieldsOnGlobalBox: function(errors) {
        var error_list = new Array();
        var self = this;

        _.each(errors.form, function(field_errors, key) {
            var field = self.searchField(key);
            var field_name = field.attr('name');

            self.higlight(field);
            
            if (errors.fields !== undefined) {
                if (errors.fields[field_name] !== undefined) {
                    field_name = errors.fields[field_name].name;
                }
            }

            _.each(field_errors, function(item) {
                var field_error_string = "<strong>" + field_name + "</strong>: " + item;
                error_list.push(field_error_string);
            });
        });

        this.setErrorsGlobal({global:error_list});
    },

    higlight: function(field) {
        if (this.options.higlight !== undefined){
            field.addClass(this.options.higlight);
        }
    },


    /* setErrors(errors)
     *
     * Draw dinamicaly all errors returned by `render_json_error` from 
     * `django-superview`
     *
    */

    setErrors: function(errors) {
        this.clear();
        var self = this;

        if (errors.global && this.globalErrorsBox !== null) {
            this.setErrorsGlobal(errors);
        }

        if (errors.form) {
            if (this.options.fieldErrorsOnGlobalBox) {
                this.setErrorsFieldsOnGlobalBox(errors);
            } else {
                this.setErrorsFieldsStandatd(errors);
            }
        }
    }
});

