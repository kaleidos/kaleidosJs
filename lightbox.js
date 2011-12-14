(function($){
 $.fn.lightbox = function(self) {
     var defaults = {
        opacity: 0.8,
        background: '#000000',
        lightboxTop: 50,
        overrideTop: false,
        overrideLeft: false,
        valing: true,
        overlay: $("#overlay"), /* false to disabled */
        forceReload: true,
        fadeIn: false,
        fadeInDuration: 'slow',
        fadeOut: false,
        fadeOutDuration: 'slow',        
        source: 'none', /* none, ajax, iframe */
        iframeSource: false,
        iframeWidth: '',
        iframeHeight: '',
        iframeSourceTarget: false,
        ajaxSource: false,
        ajaxSourceTarget: false,
        ajaxInit: function(){},
        ajaxEnd: function(){},
        onload: function(){},
        open: function(){
            if(self.overlay){                 
                self.overlay.css({
                    'height': $(window).height(),
                    'width': $(window).width(),
                    'background': self.background,
                    'opacity': self.opacity
                });
                
                self.overlay.click(function(){
                    self.close();
                    $(this).unbind('click');
                });
            }
                    
            $('.klightbox').css('z-index', 95);        
                        
            if(!self.first_load || self.forceReload){
                if(self.source=='ajax' && self.ajaxSource){
                    self.ajaxInit();
                    $.ajax({
                      url: self.ajaxSource,
                      success: function(data){
                        if(self.ajaxSourceTarget){
                            self.ajaxSourceTarget.html(data);
                        }else{
                            self.selector.html(data);
                        }
                        self.ajaxEnd();
                      }
                    });
                }else{
                    if(self.source=='iframe' && self.iframeSource){
                        var iframe = $(document.createElement('iframe'))
                        .attr({'src': self.iframeSource, 'width': self.iframeWidth, 'height': self.iframeHeight});
                        
                        if(self.iframeSourceTarget){
                            self.iframeSourceTarget.html(iframe);
                        }else{
                            self.selector.html(iframe);
                        }
                    }
                }

                self.selector.css({
                    'display': 'block',
                    'position': 'absolute',
                    'width': self.width,
                    'visibility': 'hidden'
                });
                                
                if(self.overrideTop){
                    top = self.overrideTop;
                }else{
                    if(self.valing){
                        var top = ($(document).scrollTop()) + ($(window).height()/2) - (self.selector.outerHeight()/2);
                        if (top < self.lightboxTop) {
                            top = $(document).scrollTop()+self.lightboxTop;
                        }                      
                    }else{
                        top = $(document).scrollTop()+self.lightboxTop;
                    }
                }    
                
                if(self.overrideLeft){
                    left = self.overrideLeft;
                }else{
                    left = ($(document).width()/2)-(self.width/2);
                }
                
                self.selector.css({
                    'display': 'none',
                    'visibility': 'visible',
                    'left': left,
                    'top': top,
                    'z-index': 100
                });
                
                self.first_load = true;
            }
            
            if(self.fadeIn){
                if(self.overlay) self.overlay.fadeIn(self.fadeInDuration);
                self.selector.fadeIn(self.fadeInDuration, self.onload);
            }else{
                if(self.overlay) self.overlay.show();
                self.selector.show();
                self.onload();
            }
        },
        close: function(){
            if(self.fadeOut){
                if(self.overlay) self.overlay.fadeOut(self.fadeOutDuration);
                self.selector.fadeOut(self.fadeOutDuration);
            }else{
                if(self.overlay) self.overlay.hide();
                self.selector.hide();
            }
            self.selector.data('status', 'closed');
        }
     };
     
     if($(this).data('lightbox')!=undefined){
        var self = $.extend($(this).data('lightbox'), self); 
     }else{
        var self = $.extend(defaults, self);    
        self.first_load = false;
        self.selector = $(this);        
     }
     
     $(this).data('lightbox', self);
     return self;
 };  
})(jQuery);
