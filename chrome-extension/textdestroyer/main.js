$(document).ready(function(){
    $("#number").focus();
    var num = localStorage.getItem('num');
    if(num!=null){
        $("#number").val(num);
    }
    $("#form").submit(function(e){
        localStorage.setItem('num', $("#number").val());        
        e.preventDefault();
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendRequest(tab.id, {num: $("#number").val()}, function handler(response) {
                
            });
        });
    });    
});

