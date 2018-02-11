const {dialog} = require('electron').remote
let editorState = "closed"


$(document).ready(function(){
	$("#addCat").click(function(){
		var data = {
			id: uuidv4()
		}
		var template = $("#cat-template").html();	
		var html = Mustache.render(template, data);
		$("#categoryContainer").append(html);
		console.log("Category "+ data.id + " added");
	});

	$(document).on('click', "#removeCat", function() {
		// if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().parent().remove();
			console.log("Category removed");
		// }
	});

  	$(document).on('click', "#addCard", function() {
		var data = {
			id: uuidv4()
		}
		var template = $("#card-template").html();
		var html = Mustache.render(template, data);
		$(this).parent().parent().find("div[id='cardContainer']").append(html);
		console.log("Card "+ data.id + " added");
	});

	$(document).on('click', "#removeCard", function() {
		// if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().remove();
			console.log("Card removed");
		// }
	});

	$(document).on('click', "#editCard", function() {
		var id = $("#uuid").text();
		if (editorState == "closed") {
			editorState = "open";
			$("#debugIdDisplay").text($("#debugIdDisplay").text() + id);
			$("#noSelection").slideUp();
		} else {
			editorState = "closed";
			$("#noSelection").slideDown();
			setTimeout(resetDebugIdDisplay, 300);
		}
	});

	$(document).on('click', "#editorSave", function() {
		editorState = "closed";
		$("#noSelection").slideDown();
		setTimeout(resetDebugIdDisplay, 300);
	});

	$(document).on('click', "#editorCancel", function() {
		editorState = "closed";
		$("#noSelection").slideDown();
		setTimeout(resetDebugIdDisplay, 300);
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
	dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'bmp']}]}, function (FileName) {
		$("#editorImagePreview").attr("src",FileName);
	});
}

function resetImage() {
	$("#editorImagePreview").attr("src","http://via.placeholder.com/200x150");
}

function resetDebugIdDisplay() {
	$("#debugIdDisplay").text("Id des ausgewählten Elements: ");
}