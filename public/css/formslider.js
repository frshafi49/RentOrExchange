$(document).ready(function(){
  $("form").submit(function(e) {
    e.preventDefault();
  });
  
  var cregister_person = $("#content-register-person");
  var cregister_institution = $("#content-register-institution");
  
  /* display the register page */
  $("#showregister-institution").on("click", function(e){
    e.preventDefault();
    var newheight = cregister_institution.height();
    $(cregister_institution).css("display", "block");
    
    $(cregister_person).stop().animate({
      "left": "-880px"
    }, 800, function(){ /* callback */ });
    
    $(cregister_institution).stop().animate({
      "left": "0px"
    }, 800, function(){ $(cregister_person).css("display", "none"); });
    
    $("#page").stop().animate({
      "height": newheight+"px"
    }, 550, function(){ /* callback */ });
  });
  
  /* display the login page */
  $("#showregister-person").on("click", function(e){
    e.preventDefault();
    var newheight = cregister_person.height();
    $(cregister_person).css("display", "block");
    
    $(cregister_person).stop().animate({
      "left": "0px"
    }, 800, function() { /* callback */ });
    $(cregister_institution).stop().animate({
      "left": "880px"
    }, 800, function() { $(cregister_institution).css("display", "none"); });
    
    $("#page").stop().animate({
      "height": newheight+"px"
    }, 550, function(){ /* callback */ });
  });
});