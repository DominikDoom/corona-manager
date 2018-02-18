const {dialog} = require('electron').remote;
const {app} = require('electron').remote;
const fs = require('fs');
const path = require('path');


let editorState = "closed";
let saveArray = '{"cards":[]}';


$(document).ready(function(){
	$("#addCat").click(function(){
		var data = {
			id: uuidv4()
		}
		var template = $("#cat-template").html();	
		var html = Mustache.render(template, data);
		$("#categoryContainer").append(html);
		log("Category "+ data.id + " added","d");
	});

	$(document).on('click', "#removeCat", function() {
		// if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().parent().remove();
			log("Category removed","d");
		// }
	});

  	$(document).on('click', "#addCard", function() {
		var data = {
			id: uuidv4()
		}
		var template = $("#card-template").html();
		var html = Mustache.render(template, data);
		$(this).parent().parent().find("div[id='cardContainer']").append(html);
		log("Card "+ data.id + " added","d");
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
		var categoryId = $( "p:contains(" +  cardId + ")").closest(".cat").find("#uuidcat").text();
		log("CatId:" + categoryId,"d");
		saveCard(cardId,categoryId,editorName,editorDesc);
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
		// Preparation of JSON save
		var obj = JSON.parse(saveArray);
		$.each(obj['cards'], function(index, element) {
			if (element.id == cardId) {
				var deletedItem = obj['cards'].splice(index,1);
				return false;
			}
		});
		saveArray = JSON.stringify(obj,null,4);
		log(saveArray,"d");
		saveToFile("cards", saveArray); 

		$(".card").find("p:contains(" + cardId + ")").parent().parent().remove();
		editorState = "closed";
		$("#noSelection").slideDown();
		setTimeout(resetEditor, 300);
		log("Card "+ cardId + " removed","d");
	});
});

function log(msg,mode) {
	switch (mode) {
		case "d":
			console.log("%c[DEBUG] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:orangered;", "color:steelblue;", "color:black;");
			break;
		case "e":
			console.log("%c[ERROR] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:red;", "color:steelblue;", "color:black;");
			break;
		case "s":
			console.log("%c[SUCCESS] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:green;", "color:steelblue;", "color:black;");
			break;
		default:
			console.log("%c[DEBUG] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:orangered;", "color:steelblue;", "color:black;");
			break;
	}
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

function saveCard(id,cat,name,desc) {
	var savedCard = $( "p:contains(" +  id + ")").parent().parent();
	savedCard.find("img").attr("src",$("#editorImagePreview").attr("src"));
	var img = savedCard.find("img").attr("src");
	savedCard.find(".cardName").text(name);
	savedCard.find(".cardDesc").text(desc);

	// Preparation of JSON save
	var obj = JSON.parse(saveArray);
	var time = $.now();
	if ( jQuery.isEmptyObject(obj['cards']) ) {
		obj['cards'].push({"id":id,"cat":cat,"img":img,"name":name,"desc":desc, "fav":"todo", "creationDate":time});
	}
	var counter = 0;
	$.each(obj['cards'], function(index, element) {
		if (element.id == id) {
			counter++;
			element.cat = cat;
			element.img = img;
			element.name = name;
			element.desc = desc;
			element.fav = "todo";
		}
	});
	if (counter == 0) {
		obj['cards'].push({"id":id,"cat":cat,"img":img,"name":name,"desc":desc, "fav":"todo", "creationDate":time});
	}
	saveArray = JSON.stringify(obj,null,4);
	log(saveArray,"d");
	saveToFile("cards", saveArray); 
}

function saveToFile(mode,data) {
	switch (mode) {
		case "cards":
			var dirPath = path.join(app.getPath('documents'),'Corona');
			var filePath = path.join(dirPath, 'cards.json');
			if (!fs.existsSync(dirPath)){
				fs.mkdirSync(dirPath);
			}
			try {
				fs.writeFileSync(filePath, data);
				log("File saved","s");
			} catch (error) {
				log("File save failed","e");
			}
			break;
	}
}