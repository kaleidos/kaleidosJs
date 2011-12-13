(function($){
 $.fn.validate = function(self) {
     var form = $(this);
     var defaults = {
         validClass: 'valid-field',
         invalidClass: 'invalid-field',
         globalErrorObject: false,
         inlineErrors: true,
         validateOnchange: false,
         ajax: false,
         presubmitValidation: false,
         printGlobarError: function(text, id){
            $("#field-"+id).remove();
            if(!self.globalErrorObject){
                var globalerror = $(document.createElement('div'))
                .attr('class', 'global-error');
                form.prepend(globalerror);
                self.globalErrorObject = form.find('.global-error');
            }
            
            self.globalErrorObject.append("<p id='field-"+id+"'>"+text+"</p>");             
         },
         printError: function(field){
            var error = field.data('error'); 
            $("#field-"+field.attr('id')).remove();

            if(error){
                field.addClass(self.invalidClass);                
                if(self.inlineErrors){
                    $("<span id='field-"+field.attr('id')+"'>"+field.data('error')+"</span>").insertAfter(field);
                }else{
                    self.printGlobarError(field.data('error'), field.attr('id'));
                }
            }else{
                field.addClass(self.validClass);    
            }             
         },
         printErrors: function(){
             self.elements.each(function(){
                 self.printError($(this));
             });
         },
         getAllErrors: function(){
             //need validate first
             var errors = new Array();
             self.elements.each(function(){
                var error = $(this).data('error'); 
                if(error!=undefined){
                    errors.push(error);
                }
             });
             
             return errors;
         },
         submit: function(event){
             valid = self.validate();
             self.printErrors();
             
             if(self.presubmitValidation){
                valid = self.presubmitValidation();
             }
             
             if(!valid){
                 event.preventDefault();
             }else{
                 if(self.ajax){
                     event.preventDefault();
                     $.ajax(self.ajax);
                }
             }
         },
         validate: function(){
             var valid = true;
             self.elements.each(function(){
                if(!self.isValid($(this))){
                     valid = false;
                }
             });
             return valid;
         },
         validateField: function(field){
            self.isValid(field);
            self.printError(field);
         },
         isValid: function(field){
            if(field.attr('type')=='submit'){
                    return true;
            } 
             
            var valid = true; 
            var defaultmsgs = {
                'required': 'Required.',
                'email': 'Mail invalid'
            };
            
            if(self.errorsMsgs[field.attr('name')]!=undefined){
                var msgs = $.extend(defaultmsgs, self.errorsMsgs[field.attr('name')]);
            }else{
                var msgs = defaultmsgs;
            }
            
            field.data('error', false);
            
            if(field.attr('required')!=undefined){
                if(field.attr('type')=='checkbox'){
                    if(!field.is(':checked')){
                        valid = false;
                        field.data('error', msgs.required);                        
                    }
                }else{                
                    if($.trim(field.val()).length==0){
                        valid = false;
                        field.data('error', msgs.required);
                    }
                }
            }

            if(valid && field.attr('type')=='email'){
                var email = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;
                valid = email.test(field.val());
                if(!valid)field.data('error', msgs.email);
            }   
            
            if(self.customVal!=undefined){
                if(valid && self.customVal[field.attr('name')]!=undefined){
                    valid = self.customVal[field.attr('name')](field);
                    if(!valid)field.data('error', msgs.custom);
                }
            }
            return valid;
         },
         errorsMsgs: {},
         elements: new Array()
     };
     
     var self = $.extend(defaults, self);

     self.elements = form.find('input,textarea');
     
     if(self.validateOnchange){
         self.elements.each(function(){
            var bindevent = 'keyup';
            if($(this).attr('type')=='checkbox'){
                bindevent='change';
            }

            $(this).bind(bindevent, function(){
               self.validateField($(this));
            });            
         });
     }

     form.attr("novalidate", "novalidate");
     
     $(form).bind("submit", function(event){
         self.submit(event);
     });
     
     return self;
 };  
})(jQuery);
