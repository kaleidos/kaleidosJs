(function($){
 $.fn.validate = function(params) {
     var defaults = {
         validClass: 'valid-field',
         invalidClass: 'invalid-field',
         globalErrorObject: false,
         inlineErrors: true,
         validateOnchange: false,
         ajax: false,
         presubmitValidation: false,
         printGlobarError: function(text, id){
            this.removeGlobarError(id);
            if(!this.globalErrorObject){
                var globalerror = $(document.createElement('div'))
                .attr('class', 'global-error');
                this.form.prepend(globalerror);
                this.globalErrorObject = this.form.find('.global-error');
            }
            
            this.globalErrorObject.append("<p id='field-"+id+"'>"+text+"</p>");             
         },
         removeGlobarError: function(id){
            $("#field-"+id).remove();            
         },         
         printError: function(field){
            var error = field.data('error'); 
            $("#field-"+field.attr('id')).remove();

            if(error){
                field.addClass(this.invalidClass);                
                if(this.inlineErrors){
                    $("<span id='field-"+field.attr('id')+"'>"+field.data('error')+"</span>").insertAfter(field);
                }else{
                    this.printGlobarError(field.data('error'), field.attr('id'));
                }
            }else{
                field.addClass(this.validClass);    
            }             
         },
         printErrors: function(){
             for(var i=0; i<this.elements.length; i++){
                 this.printError($(this.elements[i]));
             }
         },
         submit: function(event){
             valid = this.validate();
             this.printErrors();
             
             if(this.presubmitValidation){
                var valid2 = this.presubmitValidation();
                if(valid) valid = valid2;
             }
             
             if(!valid){
                 event.preventDefault();
             }else{
                 if(this.ajax){
                     event.preventDefault();
                     $.ajax(this.ajax);
                }
             }
         },
         validate: function(){
             var valid = true;
             for(var i=0; i<this.elements.length; i++){
                if(!this.isValid($(this.elements[i]))){
                     valid = false;
                }                 
             }

             return valid;
         },
         validateField: function(field){
            this.isValid(field);
            this.printError(field);
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
            
            if(this.errorsMsgs[field.attr('name')]!=undefined){
                var msgs = $.extend(defaultmsgs, this.errorsMsgs[field.attr('name')]);
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
            
            if(this.customVal!=undefined){
                if(valid && this.customVal[field.attr('name')]!=undefined){
                    valid = this.customVal[field.attr('name')](this, field);
                    if(!valid)field.data('error', msgs.custom);
                }
            }
            return valid;
         },
         errorsMsgs: {},
         elements: new Array()
     };
     
     var self = $.extend(defaults, params);

     if($(this).data('validator')!=undefined){
         self = $.extend($(this).data('validator'), self); 
     }else{
         self.elements = $(this).find('input,textarea,select');
         
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
         
         $(this).attr("novalidate", "novalidate")
         .bind("submit", function(event){
             self.submit(event);
         });
         self.form = $(this);
     }
     
     $(this).data('lightbox', self);
     return self;
 };  
})(jQuery);
