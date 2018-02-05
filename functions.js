const {dialog} = require('electron').remote

$(document).ready(function(){
	$("#addcat").click(function(){
		var data = {
			id: uuidv4()
		}
		var template = $("#cat-template").html();
		console.log(template);		
		var html = Mustache.render(template, data);
		$("#categorycontainer").append(html);
		console.log("added");
	});

	$(document).on('click', "#removecat", function() {
		// if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().parent().remove();
			console.log("removed");
		// }
	});

  	$(document).on('click', "#addcard", function() {
		var data = {
			id: uuidv4()
		}
		var template = $("#card-template").html();
		console.log(template);		
		var html = Mustache.render(template, data);
		$(this).parent().parent().find("div[id='cardcontainer']").append(html);
		console.log("added");
	});

	$(document).on('click', "#removecard", function() {
		// if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().remove();
			console.log("removed");
		// }
	});

	$('textarea').on("input", function(){
		var maxlength = $(this).attr("maxlength");
		var currentLength = $(this).val().length;
		$('#charNum').text(currentLength+ "/" + maxlength );
	});

	$('textarea').keydown(function(e){
		// Enter was pressed
		if (e.keyCode == 13)
		{
			// prevent default behavior
			e.preventDefault();
		}
		});
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function openImageDialog() {
	dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'bmp']}]}, function (FileNames) {
		$("#EditorImagePreview").attr("src",FileNames[0]);
	});
}