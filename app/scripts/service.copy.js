//third party libraries implementations

var clipboard = new Clipboard('.btn');


document.onkeydown = function(event){
	if(event.keyCode == 8  && (e.target.tagName != "TEXTAREA") && (e.target.tagName != "INPUT")) { 
		event.preventDefault();
		history.back(-1);
	}	

}