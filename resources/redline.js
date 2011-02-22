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
  
  $('#set-time').bind('click',function (){
    $('#time-input-shadow , #time-input-container').fadeOut(500);
    engine.setTime($('#time-input-minutes').val(),$('#time-input-seconds').val());
    $('#action').bind('click',engine.action);
    $('#reset').bind('click',engine.reset);
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
  }

  var engine = (function (){
  
    var
      time = 0,
      difference = 0,
      totalTime = 0,
      states = {STARTED:1,STOPPED:0,RESETED:3},
      mmssThread = null,
      millisecondThread = null,
      timeCheckThread = null,
      lastMinutes = ['0','0'],
      lastSeconds = ['0','0'],
      lastMillis = ['0','0','0'],
      state = states.STOPPED,
      evolutorThread = null;
      
    function reset(){
    
      var resetThread = setInterval(function (){
      
        if (!$('#dial :animated').size()){
        
          $('#action').unbind('click');
          $('#reset').unbind('click');
        
          changeDigit("#minute_1",0);
          changeDigit("#minute_2",0);
          changeDigit("#second_1",0);
          changeDigit("#second_2",0);
          changeDigit("#millisecond_1",0);
          changeDigit("#millisecond_2",0);
          changeDigit("#millisecond_3",0);
          clearInterval(resetThread);
          
          $('#progress-bar-evolutor').width(0);
        }
      },20);
    }    
    
    function stop(){
    
      clearInterval(mmssThread);
      
      clearInterval(millisecondThread);

      clearInterval(evolutorThread);
      
      difference = time - new Date();
      
      $('#action').text('Start');
    }
        
    function start(){
    
      $('#action').text('Stop');
      
      time = new Date(new Date().getTime() + difference);
      
      evolutorThread = setInterval(function (){
        var total = time - new Date();
        $('#progress-bar-evolutor').width((100 - Math.ceil(((total / totalTime) * 100))) * 4.4);
        if (total <= 0){
          clearInterval(evolutorThread);
        }
      },1);
      
      /**
      * performs the milliseconds progress
      */
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
    }
      
    return  {
      
      setTime: function (mm,ss) {
        difference = time = totalTime = (Number(mm) * 60000) + (Number(ss) * 1000);
        lastMinutes = mm.padLeft('0',2).split(''),
        lastSeconds = ss.padLeft('0',2).split(''),
        changeDigit("#minute_1",lastMinutes[0]);
        changeDigit("#minute_2",lastMinutes[1]);
        changeDigit("#second_1",lastSeconds[0]);
        changeDigit("#second_2",lastSeconds[1]);
        changeDigit("#millisecond_1",'0');
        changeDigit("#millisecond_2",'0');
        changeDigit("#millisecond_3",'0');
      },

      action: function (){

        if (state === states.STOPPED || state === states.RESETED){
    
          state = states.STARTED;
          
          start();
        
        }else{
      
          state = states.STOPPED;
          
          stop();
        }
      },
    
      reset: function (){
      
        if (state === states.STARTED){
        
          stop();
        }
        
        state = states.RESETED;
        
        reset();

        setTimeout(function (){
          $('#time-input-shadow , #time-input-container').fadeIn(500);
        },500);
      }
    }
  })();
});
