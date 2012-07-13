window.EndlessIterator = (function() {
  var _array = [];
  var _accessor = function(){}
  return {
      'current_position':0,
      'create': function(arr,acc){  
          var self = this; 
          self.current_position = 0;         
          _array = arr;
          _accessor = acc;
          return this;
      },
      'next':function(){
        var self = this;
        self.current_position += 1;
        if(self.current_position + 1 > _array.length) self.current_position = _array.length - 1;
        return _accessor.apply(_array[self.current_position])
      },
      'prev':function(){
        var self = this;
        self.current_position -= 1;
        if(self.current_position < 0 ) self.current_position = 0;
        return _accessor.apply(_array[self.current_position])
      },
      'hasPrev':function(){
        var self = this;
        return self.current_position != 0
      },
      'hasNext':function(){
        var self = this;
        return self.current_position + 1 < _array.length
      },
      'push':function(el){
       return _array.push(el);
      },
      'pop':function(){
        return _array.pop();
      },
      'length':function(){
        return _array.length;
      },
      'reset_current_position':function(){
        this.current_position = _array.length;
      }
  }    
})()


