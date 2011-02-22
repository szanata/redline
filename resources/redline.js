/**
* padLeft implementation
*/
String.prototype.padLeft = function (ch, num) {

  var 
    re = new RegExp(".{" + num + "}$"),
    pad = "";
    
  do {
    pad += ch;
  }while(pad.length < num);
  
  return re.exec(pad + this)[0];
}
/**
* trunc implementation
*/
Number.prototype.trunc = function () {
  return this | 0;
}



$(function (){

  //disable CTRL +A
  $(window).bind('keydown keyup keypress',function (e){
    if (e.keyCode === 65 && e.ctrlKey){
      return false;
    }
  });
  
  //time select commands
  $('#time-input-minutes, #time-input-seconds').val('00');
  $('#time-input-minutes, #time-input-seconds').bind('input keyup paste drop',function (e){
    $(this).val($(this).val().replace(/\D/,''));
    return true;
  });
  $('#time-input-increase-minutes').mousehold(100,function (){
    var c = Number($('#time-input-minutes').val());
    $('#time-input-minutes').val(String(c === 99 ? 0 : ++c).padLeft('0',2));
  });
  
  $('#time-input-decrease-minutes').mousehold(100,function (){
    var c = Number($('#time-input-minutes').val());
    $('#time-input-minutes').val(String(c = c === 0 ? 99 : --c).padLeft('0',2));
  });
  
  $('#time-input-increase-seconds').mousehold(100,function (){
    var c = Number($('#time-input-seconds').val());
    if (c === 59){
      c = 0;
      var m = Number($('#time-input-minutes').val());
    $('#time-input-minutes').val(String(m === 99 ? 0 : ++m).padLeft('0',2));
    }else{
      ++c;
    }
    $('#time-input-seconds').val(String(c).padLeft('0',2));
  });
  
  $('#time-input-decrease-seconds').mousehold(100,function (){
  
    var c = Number($('#time-input-seconds').val());
    if (c === 0){
      c = 59;
      var m = Number($('#time-input-minutes').val());
      $('#time-input-minutes').val(String(m = m === 0 ? 99 : --m).padLeft('0',2));
    }else{
      --c;
    }
    $('#time-input-seconds').val(String(c).padLeft('0',2));
  });
  
  /**
  * do for chrono
  */
  $('#set-time').bind('click',function (){
    $('#time-input-shadow , #time-input-container').fadeOut(500);
    engine.setTime($('#time-input-minutes').val(),$('#time-input-seconds').val());
  });

  /**
  * creates the tooltip
  */
  
  $('body').append('<div id="tip-wrapper"><div id="tip-arrow-border"></div><div id="tip-arrow"></div><div id="tip-body"></div></div>');
  
  $('#tip-body').append('Thanks for using my stopwatch. Please visit my site:<a href="http://www.iceon.me" target="blank">iceon.me</a>');  
  
  /**
  * write the obscure screen elements
  */
  $('.digit').wrap('<div class="digit-wrapper" data-current="true"></div>');
  
  $('.digit-case').prepend('<div class="digit-wrapper" style="margin-top:-200px;"><span class="digit"></span></div>');
  
  $('.digit-case').prepend('<div class="pusher"></div>');
  
  $('*').disableSelection();
  

  
  /**
  * stopwatch engine v2
  */
  var engine = (function (){
  
    var
      time = 0,
      stoppedTimeAdjust = 0,
      totalTime = 0,
      
      minutes = '',
      seconds = '',
      
      states = {STARTED:1,STOPPED:0,READY:2,OVER:3},
      
      mmssThread = null,
      millisecondThread = null,
      evolutorThread = null,
      
      lastMinutes = ['0','0'],
      lastSeconds = ['0','0'],
      lastMillis = ['0','0','0'],
      
      state = states.READY;
      
      
    /**
    * fast change a digit on screen
    */
    function fastChange(name,digit){
      
      $(name).find('.digit').text(digit);
    }
    
    /**
    * exchange the digit, performing animation
    */
    function changeDigit(name,nextDigit,duration){

      $(name).find('.digit').first().text(nextDigit);
      
      if (!$(name).find(':animated').size()){
      
        $(name).find('.pusher').animate({height:200},{
        
          duration: duration || 250,
          complete: function (){
              
            $(this).siblings('div[data-current=true]').remove();
            
            $(this).siblings('.digit-wrapper').css('margin-top','0px');
            
            $(this).siblings('.digit-wrapper').attr('data-current','true');
            
            $(this).css('margin-top','-200px');
            
            $(this).html('<span class="digit"></span>');
            
            $(this).switchClass('pusher','digit-wrapper');
            
            $(this).parent().prepend('<div class="pusher"></div>');
            
            $(this).find('*').disableSelection();
          }
        });
      }
    };
  
    function reset(){
    
      $('#action').unbind('click');
      $('#reset').unbind('click');
      $('#restart').unbind('click');
        
      var resetThread = setInterval(function (){
          
        if (!$('#dial :animated').size()){
        
          changeDigit("#minute_1",0);
          changeDigit("#minute_2",0);
          changeDigit("#second_1",0);
          changeDigit("#second_2",0);
          changeDigit("#millisecond_1",0);
          changeDigit("#millisecond_2",0);
          changeDigit("#millisecond_3",0);

          $('#progress-bar-evolutor').width(0);
          
          state = states.OVER;
          
          clearInterval(resetThread);
        }
      },20);
    };   
    
    function stop(){
    
      state = states.STOPPED;
    
      clearInterval(mmssThread);
      clearInterval(millisecondThread);
      clearInterval(evolutorThread);
      
      stoppedTimeAdjust = time - new Date();
      
      $('#action').text('Start');
    };
    
    function start(){
    
      state = states.STARTED;
      
      $('#action').text('Stop');
      
      time = new Date(new Date().getTime() + stoppedTimeAdjust);
      
      setThreads();
    };
    
    function applyReadyState(){
    
      $('#action').unbind('click');
      
      $('#reset').unbind('click');
      
      $('#restart').unbind('click');
    
      state = states.READY;
      
      stoppedTimeAdjust = time = totalTime = (Number(minutes) * 60000) + (Number(seconds) * 1000);
    
      lastMinutes = minutes.padLeft('0',2).split('');
      
      lastSeconds = seconds.padLeft('0',2).split('');
      
      lastMillis = ['0','0','0'];
      
      var resetThread = setInterval(function (){
      
        if (!$('#dial :animated').size()){
          
          changeDigit("#minute_1",lastMinutes[0]);
          
          changeDigit("#minute_2",lastMinutes[1]);
          
          changeDigit("#second_1",lastSeconds[0]);
          
          changeDigit("#second_2",lastSeconds[1]);
          
          changeDigit("#millisecond_1",'0');
          
          changeDigit("#millisecond_2",'0');
          
          changeDigit("#millisecond_3",'0');
      
          $('#progress-bar-evolutor').width(0);
          
          var rebindThread = setInterval(function (){
            if (!$('#dial :animated').size()){
              $('#action').bind('click',engine.action);
          
              $('#reset').bind('click',engine.reset);
            
              $('#restart').bind('click',engine.restart);
              
              clearInterval(rebindThread);
            }
          },20);
          
          clearInterval(resetThread);
        }
      },20);
      
      
    };
    
    function setThreads(){
    
      evolutorThread = setInterval(function (){
        var total = time - new Date();
        $('#progress-bar-evolutor').width((100 - Math.ceil(((total / totalTime) * 100))) * 4.4);
        if (total <= 0){
          clearInterval(evolutorThread);
        }
      },1);
      
      millisecondThread = setInterval(function (){
        
        var total = time - new Date();
        
        if (total <= 0){
          stop();
          fastChange('#millisecond_1',0);
          fastChange('#millisecond_2',0);
          fastChange('#millisecond_3',0);
          return;
        }
        var millis = total.toString().padLeft('0',3).split('');

        if (lastMillis[0] !== millis[0]){
          fastChange('#millisecond_1',millis[0]);
          lastMillis[0] = millis[0];
        }
        
        if (lastMillis[1] !== millis[1]){
          fastChange('#millisecond_2',millis[1]);
          lastMillis[1] = millis[1];
        }
        
        if (lastMillis[2] !== millis[2]){
          fastChange('#millisecond_3',millis[2]);
          lastMillis[2] = millis[2];
        }
      },31);
      
      mmssThread = setInterval(function (){
        
        var 
          total = time - new Date(),
          seconds = ((total / 1000) - ((total / 60000).trunc() * 60)).trunc().toString().padLeft('0',2).split(''),
          minutes = null;
        
        if (lastSeconds[1] !== seconds[1]){
          
          changeDigit("#second_2",seconds[1]);
          
          lastSeconds[1] = seconds[1];
          
          if (lastSeconds[0] !== seconds[0]){
            
            minutes = (total / 60000).trunc().toString().padLeft('0',2).split(''),
          
            changeDigit("#second_1",seconds[0]);
            
            lastSeconds[0] = seconds[0];
            
            if (lastMinutes[1] !== minutes[1]){
            
              changeDigit("#minute_2",minutes[1]);
              
              lastMinutes[1] = minutes[1];
              
              if (lastMinutes[0] !== minutes[0]){
              
                changeDigit("#minute_1",minutes[0]);
                
                lastMinutes[0] = minutes[0];
              }
            }
          }
        }
      },201);
    };
      
    return  {
      
      setTime: function (mm,ss) {
      
        minutes = mm;
        
        seconds = ss;
      
        applyReadyState();
        
      },

      action: function (){
      
        if (state === states.OVER){
          return;
        }
        state === states.STARTED ? stop() : start();
      },
      
      restart: function (){
        
        if (state === states.READY || state === states.OVER){
          return;
        }
        
        if (state === states.STARTED){
          stop();
        }

        applyReadyState();
      },
    
      reset: function (){
      
        if (state === states.OVER){
          return;
        }
        if (state === states.STARTED){
          stop();
        }
        
        reset();

        setTimeout(function (){
          $('#time-input-shadow , #time-input-container').fadeIn(500);
        },500);
      }
    }
  })();
});
