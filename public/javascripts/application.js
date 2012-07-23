jQuery(document).ready(function(){
      var socketUri = 'http://' + document.location.host + '/socket';
    var client = new Faye.Client(socketUri, {
      timeout: 130,
      endpoints: {
        websocket: 'ws://'+document.location.host+'/socket'
      }
        
    });


    Terminal.configure({
      client:client,
      callbacks:{
        after_execution:function(command){
          $("html, body").animate({ scrollTop: $(document).height() }, "fast");
        }
      }
    }).create(jQuery('#prompt'))
});

