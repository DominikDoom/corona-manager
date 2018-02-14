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

	let cardId;
	let cardOldId;
	$(document).on('click', "#editCard", function() {
		cardId = $(this).parent().parent().parent().find("#uuid").text();
		if (editorState == "closed") {
			editorState = "open";
			$("#debugIdDisplay").text($("#debugIdDisplay").text() + cardId);
			$("#noSelection").slideUp();
			cardOldId = cardId;
		} else {
			if (cardOldId !== cardId) {
				resetEditor();
				$("#debugIdDisplay").text($("#debugIdDisplay").text() + cardId);
				cardOldId = cardId;
			} else {		
				editorState = "closed";
				$("#noSelection").slideDown();
				setTimeout(resetEditor, 300);
			}
		}
	});

	$(document).on('click', "#editorSave", function() {
		var editorDesc = $("#editorInputDescription").text();
		var editorName = $("#editorInputName").text();
		saveCard(cardId,editorDesc,editorName);
		editorState = "closed";
		$("#noSelection").slideDown();
		setTimeout(resetEditor, 300);
	});

	$(document).on('click', "#editorCancel", function() {
		editorState = "closed";
		$("#noSelection").slideDown();
		setTimeout(resetEditor, 300);
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

	$(document).on('click', "#removeCard", function() {
		// if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(".card").find("p:contains(" + cardId + ")").parent().parent().remove();
			editorState = "closed";
			$("#noSelection").slideDown();
			setTimeout(resetEditor, 300);
			console.log("Card"+ cardId + "removed");
		// }
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

function resetEditor() {
	$("#debugIdDisplay").text("Id des ausgewählten Elements: ");
	$("#editorImagePreview").attr("src","http://via.placeholder.com/200x150");
	$("#editorInputDescription").text("");
	$("#editorInputName").text("");
}

function saveCard(id,desc,name) {
	var savedCard = $( "p:contains(" +  id + ")").parent().parent();
	savedCard.find("img").attr("src",$("#editorImagePreview").attr("src"));
	savedCard.find(".cardName").text(name);
	savedCard.find(".cardDesc").text(desc);
}