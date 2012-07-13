/**
*/
window.Terminal = (function(j) {
  var blinky;
  var _terminal_container;

  var tmp_history = "";

  var _terminal_cursor_class = 'terminal-cursor';
  var j_terminal_cursor_class = '.'+_terminal_cursor_class;

  var _terminal_cl_class = 'terminal-cl';
  var j_terminal_cl_class = '.'+_terminal_cl_class;

  var _terminal_cl_char_class = 'terminal-cl-char';
  var j_terminal_cl_char_class = '.'+_terminal_cl_char_class;
  
  var _terminal_message_success_class = 'terminal-message-sucess'
  var history = EndlessIterator.create([],function(){ return this });

  var defaults = {
    'elements':{ 
      'prompt':'<span>stranger@kairichardkoenig.de::~</span><br><span>>>&nbsp;</span>',
      '_command_line':'<span class="'+_terminal_cl_class+'"></span>',
      '_cursor':'<span class="'+_terminal_cursor_class+' on">&nbsp;<span>'
    },
    'callbacks':{
      successful_execution:function(command){}
    }
  };
  var config = {}     
 
  var keyCodes = {
    // left
    37: function(){
      var cursor = _terminal_container.find(j_terminal_cursor_class);
      if(cursor.prev().length != 0){
        cursor.removeClass(_terminal_cursor_class).removeClass('on').removeClass('off');
        cursor.prev().addClass(_terminal_cursor_class).addClass('on');
      }      
    },
    // right
    39: function(){
      var cursor = _terminal_container.find(j_terminal_cursor_class);
      if(cursor.next().length != 0){
        cursor.removeClass(_terminal_cursor_class).removeClass('on').removeClass('off');
        cursor.next().addClass(_terminal_cursor_class).addClass('on');
      }      
    },
    // // up
    38: function(){
      _cl_clear();
      tmp_history = tmp_history == "" ? _cl_readin() : tmp_history;
      _cl_insert(history.prev());
    },
    // // down
    40: function() {
      _cl_clear();
      _cl_insert( history.hasNext() ? history.next() : tmp_history );      
    },
    // // backspace
    8: function(){
      history.reset_current_position();
      var cursor = _terminal_container.find(j_terminal_cursor_class);
      if(cursor.prev().length != 0){
        cursor.prev().remove();
      }      
    },
    // // delete
    // 46: forwardDelete,
    // // end
    // 35: moveToEnd,
    // // start
    // 36: moveToStart,
    // // return
    13: function(){
      var command = _cl_readin();
      _terminal_container.blur();
      if(_handle_command(command)){
        config.callbacks.successful_execution.call(_terminal_container,command);
      };
      if(command != ""){
        history.push(command);
        history.current_position = history.length();
      }
      _terminal_container.find(j_terminal_cursor_class).remove();
      _terminal_container.append(j(config.elements.prompt));
      _terminal_container.append(j(config.elements._command_line).append(j(config.elements._cursor)));
      _terminal_container.focus();

    },
    // // tab
    // 18: doNothing
  };
  var ctrlCodes = {
    // // C-a
    // 65: moveToStart,
    // // C-e
    // 69: moveToEnd,
    // // C-d
    // 68: forwardDelete,
    // // C-n
    // 78: nextHistory,')
    // 78: nextHistory,
    // 80: previousHistory,
    // // C-b
    // 66: moveBackward,
    // // C-f
    // 70: moveForward,
    // // C-k
    // 75: deleteUntilEnd
  };
  var altCodes = {
    // // M-f
    // 70: moveToNextWord,
    // // M-b
    // 66: moveToPreviousWord,
    // // M-d
    // 68: deleteNextWord
  };

  function _cl_clear(){
    _terminal_container.find(j_terminal_cl_class).last().find(j_terminal_cl_char_class).remove();
  }

  function _handle_command(command){
    if(command != ""){
      _terminal_container.append(j('<div class="'+_terminal_message_success_class+'">'+command+'</div>'));
      return true;
    }else{
      _terminal_container.append("<br>");
      return false;
    }
  }

  function _cl_readin(){
    return j.map(_terminal_container.find(j_terminal_cl_class).last().find(j_terminal_cl_char_class),function(n,i){
        return j(n).text();
    }).join('');
  }

  function _keyCodeFromEvent(e) {

    // add which for key events
    // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
    var char_code = e.keyCode || e.which ;

    // right command on webkit, command on gecko
    if (char_code == 93 || char_code == 224) {
      return 91;
    }

    // map keypad numbers to top-of-keyboard numbers

    return char_code;
  }

  function _handle_control_sequence(e){
    var keyCode = _keyCodeFromEvent(e);
    // C-c: cancel the execution
    if(e.ctrlKey && keyCode == 67) {
      cancelKeyPress = keyCode;
      cancelExecution();
      return false;
    }
    if (keyCode in keyCodes) {
      cancelKeyPress = keyCode;
      (keyCodes[keyCode])();
      return false;
    } else if (e.ctrlKey && keyCode in ctrlCodes) {
      cancelKeyPress = keyCode;
      (ctrlCodes[keyCode])();
      return false;
    } else if (e.altKey  && keyCode in altCodes) {
      cancelKeyPress = keyCode;
      (altCodes[keyCode])();
      return false;
    }

  }

  function _cl_insert(k){
    if(typeof k == 'string'){
      k = j.makeArray(k);
    }
    j.map(k,function(n,i){
      _terminal_container.find(j_terminal_cursor_class)
        .before('<span class="'+_terminal_cl_char_class+'">'+n+'</span>');
    })
  }
  
  function _handle_insertion(e){
    history.reset_current_position();
    var keyCode = _keyCodeFromEvent(e);
    if ((e.ctrlKey || e.metaKey) && String.fromCharCode(keyCode).toLowerCase() == 'v') {
      // http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
      return true;
    }
    var code = String.fromCharCode(keyCode) 

    if(code == " "){
        code = "&nbsp;"
    }
    
    _cl_insert(code);

    if ($.browser.webkit) return false;
  }

  function _flash_terminal_cursor(){
    _terminal_container.find(j_terminal_cursor_class).toggleClass('on').toggleClass('off');
    return true;
  }
  function _handle_focus(e){
    if(typeof _blinky == 'number'){
      clearInterval(_blinky);
    }
    _blinky = setInterval(_flash_terminal_cursor,350);
    return true;
  }
  function _handle_blur(e){
    clearInterval(_blinky);
    _terminal_container.find(j_terminal_cursor_class).removeClass('off','on').addClass('on');
    return true;
  }
  
  return {
    configure:function(local_config){
      config = jQuery.extend(true,{},defaults,local_config);                 
      return this;
    },
    create: function(terminal_container) {
      _terminal_container = terminal_container;
      _terminal_container.append(j(config.elements.prompt));
      _terminal_container.append(j(config.elements._command_line).append(j(config.elements._cursor)));

      _terminal_container.focus(_handle_focus);
      _terminal_container.blur(_handle_blur);

      _terminal_container.keydown(_handle_control_sequence); 
      _terminal_container.keypress(_handle_insertion); 

      _terminal_container.focus();
    }
  };
})(jQuery);
