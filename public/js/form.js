"use strict";

//Plaeholder handler
$(function() {
	
if(!Modernizr.input.placeholder){             //placeholder for old brousers and IE
 
  $('[placeholder]').focus(function() {
   var input = $(this);
   if (input.val() == input.attr('placeholder')) {
    input.val('');
    input.removeClass('placeholder');
   }
  }).blur(function() {
   var input = $(this);
   if (input.val() == '' || input.val() == input.attr('placeholder')) {
    input.addClass('placeholder');
    input.val(input.attr('placeholder'));
   }
  }).blur();
  $('[placeholder]').parents('form').submit(function() {
   $(this).find('[placeholder]').each(function() {
    var input = $(this);
    if (input.val() == input.attr('placeholder')) {
     input.val('');
    }
   })
  });
 }
  
$('#contact-form').submit(function(e) {
      
		e.preventDefault();	
		var error = 0;
		var self = $(this);
		
	    var $name = self.find('[name=user-name]');
	    var $email = self.find('[type=email]');
	    var $message = self.find('[name=user-message]');
		
				
		var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		
  		if(!emailRegex.test($email.val())) {
			createErrTult('Error! Wrong email!', $email)
			error++;	
		}

		if( $name.val().length>1 &&  $name.val()!= $name.attr('placeholder')  ) {
			$name.removeClass('invalid_field');			
		} 
		else {
			createErrTult('Error! Write your name!', $name)
			error++;
		}

		if($message.val().length>2 && $message.val()!= $message.attr('placeholder')) {
			$message.removeClass('invalid_field');
		} 
		else {
			createErrTult('Error! Write message!', $message)
			error++;
		}
		
		
		
		if (error!=0)return;
		self.find('[type=submit]').attr('disabled', 'disabled');

		self.children().fadeOut(300,function(){ $(this).remove() })
		$('<p class="success"><span class="success-huge">Thank you!</span> <br> your message successfully sent</p>').appendTo(self)
		.hide().delay(300).fadeIn();


		var formInput = self.serialize();
		$.post(self.attr('action'),formInput, function(data){
		}); // end post
}); // end submit



$('#login-form').submit(function(e){

	e.preventDefault();	
	var error = 0;
	var self = $(this);
	
    var $email = self.find('[type=email]');
    var $pass = self.find('[type=password]');
   
	var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	
		if(!emailRegex.test($email.val())) {
		createErrTult("잘못된 이메일 형식입니다.", $email)
		error++;	
	}

	if( $pass.val().length>1 &&  $pass.val()!= $pass.attr('placeholder')  ) {
		$pass.removeClass('invalid_field');			
	} 
	else {
		createErrTult('패스워드를 입력하세요', $pass)
		error++;
	}
	
	if (error!=0)return;
	
	 var formInput = self.serialize();
	 $.post(self.attr('action'),formInput, function(data){
		 
		 if(data.matching=='success'){
			self.children().fadeOut(300,function(){ $(this).remove() })
			$('<p class="login__title">sign in <br><span class="login-edition">welcome to theater</span></p><p class="success">'+data.loginMessage+'</p>').appendTo(self)
			.hide().delay(300).fadeIn();
			
			window.setTimeout(function() {
			    window.location.href = '/';
			},2000);
		 }
		 else{
			 alert(data.loginMessage);
			 location.reload();
		 }
	 }); // end post
		
}); // end submit
		


$('#signUp-form').submit(function(e){

	e.preventDefault();	
	var error = 0;
	var self = $(this);
	
    var $email = self.find('[type=email]');
    var $pass = self.find('[type=password]');
   
	
			
	var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	
		if(!emailRegex.test($email.val())) {
		createErrTult("잘못된 이메일 형식입니다.", $email)
		error++;	
	}

	if( $pass.val().length>7 &&  $pass.val()!= $pass.attr('placeholder')  ) {
		$pass.removeClass('invalid_field');			
	} 
	else {
		createErrTult('패스워드는 7자 이상이여야 합니다.', $pass)
		error++;
	}
	


	
	
	
	if (error!=0)return;
	
	 var formInput = self.serialize();
	 $.post(self.attr('action'),formInput, function(data){
		 
		 if(data.matching=='success'){
			self.children().fadeOut(300,function(){ $(this).remove() })
			$('<p class="login__title">sign in <br><span class="login-edition">welcome to theater</span></p><p class="success">회원가입을 축하합니다.<br>로그인 해주십시오.</p>').appendTo(self)
			.hide().delay(300).fadeIn();
			
			window.setTimeout(function() {
			    window.location.href = '/login';
			},2000);
		 }
		 else{
			 alert(data.signUpMessage);
			 location.reload();
		 }
	 }); // end post
		
}); // end submit
		
		

function createErrTult(text, $elem){
			$elem.focus();
			$('<p />', {
				'class':'inv-em alert alert-danger',
				'html':'<span class="icon-warning"></span>' + text + ' <a class="close" data-dismiss="alert" href="#" aria-hidden="true"></a>',
			})
			.appendTo($elem.addClass('invalid_field').parent()) 
			.insertAfter($elem)
			.delay(4000).animate({'opacity':0},300, function(){ $(this).slideUp(400,function(){ $(this).remove() }) });
	}
});
