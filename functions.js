const {dialog} = require('electron').remote
let editorState = "closed"
let saveArray = '{"cards":[]}';


$(document).ready(function(){
	$("#addCat").click(function(){
		var data = {
			id: uuidv4()
		}
		var template = $("#cat-template").html();	
		var html = Mustache.render(template, data);
		$("#categoryContainer").append(html);
		debug("Category "+ data.id + " added");
	});

	$(document).on('click', "#removeCat", function() {
		// if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().parent().remove();
			debug("Category removed");
		// }
	});

  	$(document).on('click', "#addCard", function() {
		var data = {
			id: uuidv4()
		}
		var template = $("#card-template").html();
		var html = Mustache.render(template, data);
		$(this).parent().parent().find("div[id='cardContainer']").append(html);
		debug("Card "+ data.id + " added");
	});

	let cardId;
	let cardOldId;
	$(document).on('click', "#editCard", function() {
		cardId = $(this).parent().parent().parent().find("#uuid").text();
		loadEditor(cardId);
		if (editorState == "closed") {
			editorState = "open";
			$("#debugIdDisplay").text($("#debugIdDisplay").text() + cardId);
			$("#noSelection").slideUp();
			cardOldId = cardId;
		} else {
			if (cardOldId !== cardId) {
				resetEditor();
				loadEditor(cardId);
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
		var editorDesc = $("#editorInputDescription").val();
		var editorName = $("#editorInputName").val();
		saveCard(cardId,editorName,editorDesc);
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
			debug("Card"+ cardId + "removed");
		// }
	});
});

function debug(msg) {
	console.log("%c[DEBUG] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:orangered;", "color:steelblue;", "color:black;");
}

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
	$("#editorInputName").val("");
	$("#editorInputDescription").val("");
}

function loadEditor(id) {
	var loadedCard = $( "p:contains(" +  id + ")").parent().parent();

	var img = loadedCard.find(".cardImage").attr("src");
	var name = loadedCard.find(".cardName").text();
	var desc = loadedCard.find(".cardDesc").text();

	$("#editorImagePreview").attr("src",img);
	$("#editorInputName").val(name);
	$("#editorInputDescription").val(desc);
}

function saveCard(id,name,desc) {
	var savedCard = $( "p:contains(" +  id + ")").parent().parent();
	savedCard.find("img").attr("src",$("#editorImagePreview").attr("src"));
	var img = savedCard.find("img").attr("src");
	savedCard.find(".cardName").text(name);
	savedCard.find(".cardDesc").text(desc);

	// Preparation of JSON save
	var obj = JSON.parse(saveArray);
	if (obj['cards'].id !== id) {
		obj['cards'].push({"id":id,"img":img,"name":name,"desc":desc});
		saveArray = JSON.stringify(obj,null,4);
		debug(saveArray);
		saveToFile("cards",saveArray);
	} else {
		debug("ID duplicate");
	}
}

function saveToFile(mode,jsonString) {
	//TODO
}