$(document).ready(function(){
    var audio = new Audio("sound/timeOver.mp3");
    var walk_imagesrc = '../res/image/walk_pictogram.png';
    var timeOver_imagesrc = '../res/image/tired_pictogram.png';
    var acc_ratio; // 加速度値のレート(デバイスにより異なる)
    var ua = navigator.userAgent;
    var iOS = false;
     if(ua.search(/iPhone/)!== -1){
      // iPhone
        iOS = true;
        if(window.screen.height==568){
         	// iPhone5
            acc_ratio = 1/75;
        }else{
         	// その他のiPhone
            acc_ratio = 1/20;
        }
    }else{
    	acc_ratio = 1/20;   
    }

    var acc_ignore_tm = 60;	// 加速度値が閾値を超えて検出された場合でも、前回の取得から一定時間経過していないとノイズと判定する
    
    // デバイス加速度取得時のコールバック関数
    //var min_acc = 17;
    var prev_tm = 0;
    
    var min_up_acc = 0.3;	// 振り上げたと判定する最小の加速度値
    var min_down_acc = 0.5;	// 振り下ろしたと判定する最小の加速度値
    var wait_timer = null;
    var countdown_timer = null;
    var strong_axis;	// 最も加速度値の強い軸
    var prev_direction; 	// 前回の加速度値の方向（0:負の方向 1:正の方向)
    var direction = 0;		// 今回の加速度値の方向
    var pair_wait = false;	// 振り上げ動作後の振り下ろし動作の待機
    var prev_acc = -1;
    var curr_acc = -1;
    
    var count = 0;
    var toggle = false;
    function device_motion(e){
        if(iOS){
            if(toggle){
               toggle = false;
               return; 
            }else{
            	toggle = true;   
            }
        }
        
        var acc = e.accelerationIncludingGravity;
        var acc_x = acc.x * acc_ratio;
        var acc_y = acc.y * acc_ratio;
        var acc_z = acc.z * acc_ratio;
        
        // 最も加速度を強く検出した軸を取得
        if(Math.abs(acc_x) > Math.abs(acc_y)){
        	strong_axis = 'x';
            if(Math.abs(acc_z) > Math.abs(acc_x)){
            	strong_axis = 'z';  
            }
        }else{
        	strong_axis = 'y';
            if(Math.abs(acc_z) > Math.abs(acc_y)){
            	strong_axis = 'z';  
            }
        }
        // 最も加速度を強く検出した軸を基準にした振られた方向を判定
        switch(strong_axis){
            case 'x':
 	           direction = (acc_x>0)?1:0;
            	break;
            case 'y':
            	direction = (acc_y>0)?1:0;
            	break;
            case 'z':
            	direction = (acc_z>0)?1:0;
            	break;
        }
        
        // 3軸を合わせた加速度値を計算する
        curr_acc = Math.sqrt(Math.pow(acc_x, 2)+Math.pow(acc_y, 2)+Math.pow(acc_z, 2));
        if(pair_wait){
            // 振り下ろし動作の待機状態
            
            // 前回振り下ろした時間からの経過時間を計算する
             var date = new Date();
             var tm = date.getTime();
             var diff = tm - prev_tm;

            if(diff > acc_ignore_tm && direction != prev_direction && 
               ((prev_acc > min_up_acc && curr_acc > min_down_acc) || 
                (prev_acc > min_down_acc && curr_acc > min_up_acc))){
                // 振り上げ・振り下ろし動作の完了
                count++;
                $('.count').text(count);
                pair_wait = false;
                if(wait_timer){
                    clearTimeout(wait_timer);  
                    wait_timer = null;
                }
                prev_tm = tm;
            }
        }else{
            var date = new Date();
            var tm = date.getTime();
            var diff = tm - prev_tm;
            
            if(diff > acc_ignore_tm && (curr_acc > min_up_acc || curr_acc > min_down_acc)){
                // 一定以上の加速度値が検出された
                
                pair_wait = true; // 振り下ろし待機状態に
                prev_acc = curr_acc;	// 検出された加速度値を保存
              
                // タイマー設定
                // 一定時間経過しても一定以上の加速度値が検出されなければ
                // 振り下ろし待機状態をキャンセル
                wait_timer = setTimeout(function(){
                    pair_wait = false;
                }, 500);
                
                prev_direction = direction;
            } 
        }
    }
    
    var action_state  = 0;
   	var shake_sec = 0;
    var count_down = 2;
    $('.action').click(function(){
        $('.timeOverImage').hide();
        // タイマー設定の有無検査
        if (  $('#setTime').val() == '' || $('#setTime').val() < 0 ){
            $('.countdown').text('タイマーを設定してください。');
            return;
        }
        else{
            $('.countdown').text('');  
        }
        // タイマー分を取得し、秒単位に変換
        shake_sec = $('#setTime').val() * 60;    
        
        if(action_state == 0){
            $('.count').text(0);
            $('.countdown').text("");
        
            count_down = 2;
            countdown_timer = setInterval(function(){
      
                if(count_down==0){
            		$('.countdown').text('歩いて！！');              
                    window.addEventListener('devicemotion', device_motion);
                }else if(count_down>0){
                	$('.countdown').text(count_down);
                }else{
                	// シェイク中
                    if(-count_down == shake_sec){
                        // 終了音
                        audio.play();
                    	// タイムアウト
                        $('.countdown').text('タイムオーバー');
                        $('.timeOverImage').show();
                        $('.timeOverImage').attr('src', timeOver_imagesrc);
                        window.removeEventListener('devicemotion', device_motion);
                        
                        $('.action').text('スタート');
                        
                    }else if(-count_down < shake_sec){
                    
                    	$('.countdown').text('残時分 '+ ('0' + Math.floor((shake_sec+count_down)/60)).slice(-2)+':'+( '0' + ((shake_sec+count_down)%60)).slice(-2));
                        if($('.timeOverImage').is(':hidden')){
                            $('.timeOverImage').show();
                            $('.timeOverImage').attr('src', walk_imagesrc);
                        }
                    }else{
                        clearInterval(countdown_timer);
                		countdown_timer = null;
                        action_state = 0;
                        
                        alert('歩数：'+count);
                        
                        count_down = 0;
                        count = 0;
                    }
                }
               
                count_down--;
            }, 1000);
           
            action_state = 1;
            $(this).text('ストップ');
        }else{
            clearInterval(countdown_timer);
            countdown_timer = null;
            
          	window.removeEventListener('devicemotion', device_motion);
            action_state = 0;
            count_down = 0;
            count = 0;
            $(this).text('スタート');
        }
    });
});

