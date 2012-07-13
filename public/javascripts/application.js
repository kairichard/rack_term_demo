jQuery(document).ready(function(){
    Terminal.configure({
      callbacks:{
        successful_execution:function(command){
          $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        }
      }
    }).create(jQuery('#prompt'))
});

