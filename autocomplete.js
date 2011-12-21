(function($){
 $.fn.autocomplete = function(self) {
    var defaults = {
        dataAjax: {},
        widthAutocomplete: 'auto' /* 00px auto max */,
        startLength: 2,
        maxHeight: 150,
        onSelect: function(){},
        selectItem: function(elm){
           self.input.val($(elm).data('value'));
           self.close();
           self.onSelect();
        },
        printSource:function(data){
           if(!data.items.length)return false;
           if(!self.open){
               var autocomplete = $("#autocomplete");
               if(!autocomplete.length){
                  autocomplete = $("<div id='autocomplete'><div id='autocompleteinner'></div></div>").appendTo("body");
               }else{
                   autocomplete.data("input").open = false;
               }
               autocomplete.data("input", self);
               var autocompleteinner = $("#autocompleteinner");
               var width = 'auto';
               if(self.widthAutocomplete=='auto'){
                   width = self.input.outerWidth()
                   -parseInt(autocomplete.css('padding-left').replace('px', ''))
                   -parseInt(autocomplete.css('padding-right').replace('px', ''))
                   -parseInt(autocomplete.css('border-left-width').replace('px', ''))
                   -parseInt(autocomplete.css('border-right-width').replace('px', ''));
               }else{
                    if(self.widthAutocomplete=='max'){
                        width = 'auto';
                    }else{
                        width = self.widthAutocomplete;
                    }
               }
               
               autocomplete.css({
                   'width': width,
                   'display': 'block',
                   'position': 'absolute',
                   'top': $(self.input).offset().top+$(self.input).outerHeight(),
                   'left': $(self.input).offset().left
               });
               
               autocompleteinner.css({
                   'overflow-x': 'auto',
                   'max-height': self.maxHeight
               });                       

               self.open = true;
               autocompleteinner.scrollTop(0);
               $(document).bind('click', function(e){
                    if($(e.target).hasClass('item-autocomplete')){
                        self.selectItem(e.target);
                        $(this).unbind();
                    }else{
                        self.close();
                    }
               });
           }else{
               var autocomplete = $("#autocomplete");
               var autocompleteinner = $("#autocompleteinner");
           }
            
            autocompleteinner.html("");
            var html = "<ul>";
            for(var i=0; i<data.items.length; i++){
                $($(document.createElement('li')).append(
                    $(document.createElement('a')).click(function(e){
                       e.preventDefault();
                    })
                    .attr({'href': '', 'class': 'item-autocomplete'})
                    .data(data.items[i])
                    .html(data.items[i].label)                
                )).appendTo(autocompleteinner);
            }
            html+="</ul>";
        }
    };
    
    if($(this).data('autocomplete')!=undefined){
       var self = $.extend($(this).data('autocomplete'), self); 
    }else{
       var self = $.extend(defaults, self);    
       self.input = $(this);
       self.input.attr('autocomplete', 'off');
       self.open = false;
       self.close = function(){
           $("#autocomplete").hide();
           self.open = false;           
       }
       self.move = function(type){
           var autocomplete = $("#autocomplete");
           var selected = autocomplete.find('.selected');
           if(selected.length){
               var lis = $(autocomplete).find('li');
               var index = 0;
               for(var i=0; i<lis.length; i++){
                if($(lis[i]).hasClass('selected')){
                    $(lis[i]).removeClass('selected');
                    if(type==40){
                        if(lis.length==i+1){
                            index= 0;
                        }else{
                            index= i+1;
                        }
                    }else{
                        if(i-1<0){
                            index = lis.length-1;
                        }else{
                            index = i-1;
                        }
                    }
                    break;
                }
               }
               $(lis[index]).addClass('selected');
               var total_height = 0;
               var total_scroll = 0;
               for(var i=0; i<lis.length; i++){
                total_height+=$(lis[i]).outerHeight();   
                if(total_height>self.maxHeight){
                    total_scroll += $(lis[i]).outerHeight()
                }
                if($(lis[i]).hasClass('selected')){
                    break;
                }
               }
                if((total_height - $("#autocompleteinner").scrollTop()) > self.maxHeight) {
                    $("#autocompleteinner").scrollTop(total_height - self.maxHeight);
                } else if(total_height-$(lis[index]).outerHeight() < $("#autocompleteinner").scrollTop()) {
                   $("#autocompleteinner").scrollTop(total_height-$(lis[index]).outerHeight())
                } 
           }else{
               $(autocomplete).find('li:first').addClass('selected');
           }
       }
       
       self.input.bind('keydown', function(e) {
           if(e.which==13 && self.open){       
               var selected = $("#autocomplete").find('.selected');
               self.selectItem($(selected).find('a'));
               return false;               
           }    
       })    
           
       self.input.bind('keyup', function(e) {
           if(e.which==13)return false;
           if(e.which==38 || e.which==40){
               if((e.which==40 && self.open==true || e.which==38)){
                self.move (e.which);
                return false;                   
               }
           }
           
           if(self.input.val().length==0){
               self.close();
           }else{
               if(self.input.val().length<self.startLength){
                    return false;  
               }
               if(typeof self.source == 'object'){
                self.printSource(self.source);
               }else{
                $.ajax({
                    type: 'get', 
                    data: self.dataAjax,
                    url: self.source,
                    dataType: 'json',
                    success: self.printSource
                });
               }
           }
       });
     }
     
     $(this).data('lightbox', self);
     return self;
 };  
})(jQuery);

