chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    var num = request.num;
    if(num>0){
        var auxtext = text;
        while(num>auxtext.length){
            auxtext+=" "+text;
        }
        auxtext = auxtext.substring(0, num);
        $("p, a, h1, h2, h3, h4, span").each(function(){
            var insert = true;
            if($(this).is('span')){
                if($(this).parent().is('p')){
                 insert = false;
                }
            }
            
            if(insert){
                if($.trim($(this).text()).length){
                    $(this).text(auxtext);
                }
            }
        });
    }
  });


var text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam commodo pellentesque felis, a ullamcorper augue volutpat blandit. Nam scelerisque sem a lectus ornare malesuada tempor purus tincidunt. Nulla porttitor sagittis accumsan. Ut fermentum elementum odio, quis consectetur tortor ultricies a. Phasellus aliquam sodales velit, sed rutrum eros varius ac. Nam purus est, hendrerit eget venenatis sit amet, ultricies at enim. Aenean nec aliquet ante. Suspendisse nec libero nibh, sed lobortis nulla. Proin bibendum egestas magna, a sagittis leo feugiat at. Suspendisse mollis justo vestibulum mi pretium ac sagittis tellus sodales."
