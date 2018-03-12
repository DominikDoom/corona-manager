/*  
##################################
##      Initialisierung der		##
##      Electron-Einbindung		##
##    und globaler Variablen. 	##
##################################
*/

// Electron.remote wird benötigt, da diese Dinge nicht im Renderer-Prozess initialisiert werden können
const {dialog} = require('electron').remote;
const {app} = require('electron').remote;
const fs = require('fs');
const path = require('path');
const nativeImage = require('electron').nativeImage;

// Initialisierung von Variablen, die als Speicher für UI-Zustände oder IDs dienen
var editorState = "closed";
var deleteMode;
var catToDelete;
// Für Karten und Kategorien wird ein leeres JSON Objekt mit benanntem Array erstellt
var cardSaveArray = '{"cards":[]}';
var catSaveArray = '{"cats":[]}';

/*  
##################################
##    document.ready enthält	##
##    Funktionen, die direkt  	##
##  mit der UI verknüpft sind.	##
##################################
*/
$(document).ready(function(){

	// Hinzufügen einer Kategorie (verwendet Mustache)
	$("#addCat").click(function(){
		// Die data Variable wird initialisiert, da Mustache diese Daten dann in entsprechend formatierte Objekte direkt im HTML-Template einsetzt
		var data = {
			id: uuidv4()										// uuidv4() erstellt eine einzigartige ID, die direkt in Mustache integriert werden kann
		}
		var template = $("#cat-template").html();				// Das Template wird geladen
		var html = Mustache.render(template, data);
		$("#categoryContainer").append(html);					// Der von Mustache vervollständigte HTML-Code wird in den Kategoriecontainer eingefügt
		log("Category "+ data.id + " added","d");
		saveCat(data.id,"Name");								// saveCat() speichert die soeben hinzugefügte kategorie direkt in einer JSON-Datei ab
	});

	// Bearbeiten des Kategorienamens
	$(document).on('click', "#catName", function() {			// Klick auf den Namen
        var dad = $(this).closest(".cat");
		var catName = dad.find('.catName');
		catName.hide();											// Der Name wird unsichtbar gemacht
		// Das zu der aktuellen Kategorie gehörige Input-Feld wird selektiert und an der Stelle sichtbar gemacht, wo vorher der Name stand
		var editInput = dad.find('.editCatName');
		editInput.val(catName.text());							// Der alte Name wird eingefügt, sodass man nicht immer alles neu tippen muss
		editInput.show();
		editInput.focus();										// Automatischer Fokus
    });
	
	// Wenn aus dem Inputfeld zum Bearbeiten des Kategorienamens geklickt wird, wird die Bearbeitung beendet
    $(document).on('focusout',".editCatName", function(event) {
        var dad = $(this).closest(".cat");
		var catName = dad.find('.catName');
		catName.text($(this).val());							// Der Inhalt des Input-Felds wird dem Namenslabel übergeben
        $(this).hide();											// Das Inputfeld wird wieder versteckt
		catName.show();											// Der Name ist wieder sichtbar
		saveCat(dad.find("#uuidcat").text(), catName.text());	// Die veränderte Kategorie wird direkt auch in der Datei aktualisiert
	});

	// Wird im Inputfeld zum Bearbeiten des Kategorienamens Enter gedrückt, wird der Fokus beendet, sodass die obere Funktion aufgerufen wird
	$(document).on('keydown', ".editCatName", function(e) {
		// Enter was pressed
		if (e.keyCode == 13)
		{
			$(".editCatName").blur();
		}
	});
	
	// Entfernen einer Kategorie. Zum Ermöglichen einer Sicherheitsfrage ist der eigentliche Löschcode in der #dialogConfirm on click Funktion ausgelagert
	$(document).on('click', "#removeCat", function() {
		var dad = $(this).closest(".cat");
		catToDelete = dad.find("#uuidcat").text();				// catToDelete dient als ID-Speicher

		deleteMode = "cat";										// Der deleteMode gibt der Dialogsbestätigungsfunktion an, welcher Löschvorgang ausgeführt werden soll
		$(".alertOverlay").css("display","block");				// Das Bestätigungsoverlay und der darin liegende Ja-Nein-Dialog werden sichtbar gemacht
	});

	// Hinzufügen einer Karte (verwendet Mustache)
  	$(document).on('click', "#addCard", function() {
		var data = {
			id: uuidv4(),										// Wie bereits bei der Kategorie bekommt auch die Karte eine uuid zugeteilt
			pos: 0,												// pos gibt die Indexposition der Karte an, wird hier nur temporär mit 0 initialisiert und später überschrieben
			time: $.now()	
		}
		var template = $("#card-template").html();				// Das Template wird geladen
		var html = Mustache.render(template, data);
		$(this).parent().parent().find("div[id='cardContainer']").append(html);	// Der von Mustache vervollständigte HTML-Code wird in den Kartencontainer der Elternkategorie eingefügt
		log("Card "+ data.id + " added","d");
		// Der Inhalt von Name und Beschreibung der Neuen Karte wird mit einem Template-Text initialisiert
		createThumbnail("img/default.png",data.id);
		var name = "Name";
		var desc = "The quick brown fox jumps over the lazy dog";
		var categoryId = $( "p:contains(" +  data.id + ")").closest(".cat").find("#uuidcat").text();	// Die ID der Elternkategorie wird gelesen, um sie in der JSON-Datei einzufügen
		saveCard(data.id,categoryId,name,desc,data.time);					// Speichert die neu erstellte Karte in einer JSON-Datei
		updatePosition();										// Aktualisiert die bisher mit 0 initialisierte Indexposition, wird auch direkt in der JSON-Datei aktualisiert 
	});

	var cardId;													// cardId speichert die Id der Karte, die zuletzt im Editor geladen wurde
	var cardOldId;												// cardOldId dient der Kontrolle, ob der Editor geschlossen werden muss oder offen bleiben kann
	// Bearbeiten einer Karte (öffnet nur den Editor und übergibt diesem den aktuell in der Karte enthaltenen Text)
	$(document).on('click', "#editCard", function() {
		cardId = $(this).parent().parent().parent().find("#uuid").text();
		loadEditor(cardId);
		if (editorState == "closed") {							// Klicken des Edit-Buttons nach dem Schließen des Editors / Erstmaliges Klicken
			editorState = "open";
			$("#debugIdDisplay").text($("#debugIdDisplay").text() + cardId);	// #debugIdDisplay ist eine Anzeige im Editor, die später nur sichtbar sein wird, wenn der Debugmodus aktiviert ist
			$("#idStorage").text(cardId);						// #idStorage enthält die selbe ID wie #debugIdDisplay, jedoch ohne zusätzlichen Text, sodass die ID direkt davon ausgelesen werden kann
			$("#noSelection").slideUp();
			cardOldId = cardId;
		} else {												// Editor ist bereits offen
			if (cardOldId !== cardId) {							// Eine andere Karte als die aktuell geladene soll bearbeitet werden
				resetEditor();									// resetEditor() setzt den Editor auf default-Status zurück, um etwas Neues zu laden ohne mit dem Alten in Konflikt zu geraten
				loadEditor(cardId);								// Lädt die neue Karte, der Editor bleibt dabei offen
				$("#debugIdDisplay").text($("#debugIdDisplay").text() + cardId);
				$("#idStorage").text(cardId);
				cardOldId = cardId;
			} else {											// Die schon geladene Karte wurde erneut geklickt -> toggle switch, der Editor wird wieder geschlossen
				editorState = "closed";
				$("#noSelection").slideDown();
				setTimeout(resetEditor, 300);					// Der verzögerte Funktionsaufruf ist nötig, um den Editor erst zu clearen, wenn die "Tür" komplett heruntergefahren ist
			}
		}
	});

	// Der Hoch-Pfeil einer Karte wurde gedrückt
	$(document).on('click', "#upCard", function(e) {
		var wrapper = $(this).closest('#card')
		wrapper.insertBefore(wrapper.prev())					// Die Karte an sich wird im HTML-DOM-Tree verschoben
		updatePosition();										// Die Position wird auch in der JSON-Datei aktualisiert abgespeichert
	});
	// Der Runter-Pfeil einer Karte wurde gedrückt
	$(document).on('click', "#downCard", function(e) {
		var wrapper = $(this).closest('#card')
		wrapper.insertAfter(wrapper.next())						// Die Karte an sich wird im HTML-DOM-Tree verschoben
		updatePosition();										// Die Position wird auch in der JSON-Datei aktualisiert abgespeichert
	});

	// Die im Editor geladene Karte soll gespeichert werden
	$(document).on('click', "#editorSave", function() {
		// Die Variablen werden mit den Daten der Editor-Inputs gefüllt (Thumbnail-Bild wird in saveCard() behandelt)
		var editorDesc = $("#editorInputDescription").val();
		var editorName = $("#editorInputName").val();
		var categoryId = $( "p:contains(" +  cardId + ")").closest(".cat").find("#uuidcat").text();
		var time = $.now();
		saveCard(cardId,categoryId,editorName,editorDesc,time);		// Die Änderungen werden zum Speichern in der JSON-Datei übergeben
		editorState = "closed";
		$("#noSelection").slideDown();
		setTimeout(resetEditor, 300);							// Der verzögerte Funktionsaufruf ist nötig, um den Editor erst zu clearen, wenn die "Tür" komplett heruntergefahren ist
	});

	// Die im Editor gemachten Änderungen sollen nicht übernommen werden
	$(document).on('click', "#editorCancel", function() {
		editorState = "closed";
		$("#noSelection").slideDown();
		setTimeout(resetEditor, 300);							// Der verzögerte Funktionsaufruf ist nötig, um den Editor erst zu clearen, wenn die "Tür" komplett heruntergefahren ist
	});

	// Aktualisierung der "x/y Zeichen verwendet" Anzeige im Inputfeld für die Beschreibung, wenn darin eine Taste gedrückt wird
	$('#editorInputDescription').on("input", function(){
		var maxlength = $(this).attr("maxlength");				// Holt dynamisch die Maximallänge aus den Attributen des Textfeldes, vorgesehener Standard ist 135
		var currentLength = $(this).val().length;				// Holt die aktuelle Zeichenanzahl
		$('#charNum').text(currentLength+ "/" + maxlength );	// Aktualisiert die Textanzeige
	});

	// Verhindert das drücken von Enter im Inputfeld für die Beschreibung, da Zeilenumbrüche nicht als Zeichen gelten und so die Beschreibung über die Karte hinaus overflowen lassen können
	$('#editorInputDescription').keydown(function(e){
		// Enter was pressed
		if (e.keyCode == 13)
		{
			// prevent default behavior
			e.preventDefault();
		}
	});

	// Entfernen einer Karte
	$(document).on('click', "#removeCard", function() {
		deleteMode = "card";									// Wie bereits bei der Kategorie ist auch hier der Löschcode in den Bestätigungsdialog ausgelagert
		$(".alertOverlay").css("display","block");				// Das Bestätigungsoverlay und der darin liegende Ja-Nein-Dialog werden sichtbar gemacht
	});

	// Löschbestätigung wird bejaht, enthält den eigentlichen Code zum Löschen
	$(document).on('click', "#dialogConfirm", function() {
		switch (deleteMode) {
			case "card":										// Karte soll gelöscht werden
				// Preparation of JSON save
				var obj = JSON.parse(cardSaveArray);			// Der JSON String wird in ein Objekt umgewandelt
				$.each(obj['cards'], function(index, element) {	// Alle gespeicherten Karten werden durchlaufen
					if (element.id == cardId) {					// ID-Match
						var deletedItem = obj['cards'].splice(index,1);	// Die Karten sind als Arrayelemente im JSON gespeichert, daher kann man nicht mit .remove arbeiten, dies führt zu null-Values im JSON
						return false;							// Da die erwünschte Karte gelöscht wurde, wird die each-Schleife abgebrochen
					}
				});
				cardSaveArray = JSON.stringify(obj,null,4);		// Das JSON-Objekt wird wieder in Text umgewandelt und automatisch prettiefied
				log(cardSaveArray,"d");
				saveToFile("card", cardSaveArray); 				// Der aktualisierte JSON-String wird in der Datei gespeichert

				deleteThumb(cardId);							// Das der gelöschten Karte zugehörige Thumbnail wird ebenfalls gelöscht

				$(".card").find("p:contains(" + cardId + ")").parent().parent().remove();	// Die eigentliche Karte wird aus dem HTML-DOM-Tree entfernt
				// Der Editor wird geschlossen und resetted, da die geladene Karte nicht mehr existiert
				editorState = "closed";							
				$("#noSelection").slideDown();
				setTimeout(resetEditor, 300);
				log("Card "+ cardId + " removed","d");

				$(".alertOverlay").css("display","none");		// Das Bestätigungsoverlay und der darin liegende Ja-Nein-Dialog werden wieder ausgeblendet
				break;
			case "cat":											// Kategorie soll gelöscht werden
				var catId = catToDelete;						// Um nicht aufwendig ausgelesen zu werden, wird die ID aus der beim Klick auf "Kategorie löschen" aktualisierten catToDelete-Variable entnommen
				// Preparation of JSON save
				var obj = JSON.parse(catSaveArray);				// Der JSON String wird in ein Objekt umgewandelt
				$.each(obj['cats'], function(index, element) {	// Alle gespeicherten Kategorien werden durchlaufen
					if (element.id == catId) {					// ID-Match
						var deletedItem = obj['cats'].splice(index,1);	// Die Kategorien sind als Arrayelemente im JSON gespeichert, daher kann man nicht mit .remove arbeiten, dies führt zu null-Values im JSON
						return false;							// Da die erwünschte Kategorie gelöscht wurde, wird die each-Schleife abgebrochen
					}
				});
				catSaveArray = JSON.stringify(obj,null,4);		// Das JSON-Objekt wird wieder in Text umgewandelt und automatisch prettiefied
				log(catSaveArray,"d");
				saveToFile("cat", catSaveArray);				// Der aktualisierte JSON-String wird in der Datei gespeichert
				deleteContainedCards(catId);					// Alle in der Kategorie enthaltenen Karten werden ebenfalls gelöscht, um die Datei sauber zu halten
		
				$(document).find("p:contains(" + catId + ")").parent().parent().remove();	// Die eigentliche Kategorie wird aus dem HTML-DOM-Tree entfernt, dabei werden enthaltene Karten automatisch mit entfernt
				log("Category " + catId + " removed","d");
				$(".alertOverlay").css("display","none");		// Das Bestätigungsoverlay und der darin liegende Ja-Nein-Dialog werden wieder ausgeblendet
				break;
		}
	});

	// Löschbestätigung wird verneint
	$(document).on('click', "#dialogDeny", function() {
		// Da der Löschcode in der #dialogConfirm on click Funktion liegt, sind hier kene weiteren Schritte notwendig
		$(".alertOverlay").css("display","none");				// Das Bestätigungsoverlay und der darin liegende Ja-Nein-Dialog werden wieder ausgeblendet
	});
});

/*  
##################################
##  Ab hier kommen Funktionen, 	##
##  die nicht mehr direkt mit	##
##    der UI verknüpft sind.	##
##################################
*/

// Logfunktion, gibt eine Debug, Error, oder Erfolgsmitteilung in der Konsole aus, inklusive Styling und Timecode
function log(msg,mode) {
	switch (mode) {
		case "d":												// Debug
			console.log("%c[DEBUG] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:orangered;", "color:steelblue;", "color:black;");
			break;
		case "e":												// Error
			console.log("%c[ERROR] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:red;", "color:steelblue;", "color:black;");
			break;
		case "s":												// Success
			console.log("%c[SUCCESS] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:green;", "color:steelblue;", "color:black;");
			break;
		default:												// Falls nicht angegeben, Debug
			console.log("%c[DEBUG] %c" + new Date($.now()) + ":\n" + "%c" + msg, "color:orangered;", "color:steelblue;", "color:black;");
			break;
	}
}

// Erstellt eine eindeutige, einzigartige uuid, die zum Identifizieren von Kategorien und Karten genutzt wird
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Der native Node/Electron File Dialog zum Auswählen der Bilddatei
function openImageDialog() {
	// Öffnet den Dialog mit jpg, png und bmp als Filter
	dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'bmp']}]}, function (FileName) {	// Diese Funktion wird beim öffnen einer Bilddatei aufgerufen
		var id = $("#idStorage").text();						// Liest #idStorage im Editor aus, um schnell an die ID der Karte zu gelangen
		var img = createThumbnail(FileName[0],id);				// createThumbnail() erstellt ein Thumbnail aus dem gewählten Bild mit der ID der Karte als Name
		$("#editorImagePreview").attr("src", img +"#" + new Date().getTime());	// Das Bild im Editor wird aktualisiert, DateTime wird angehängt, um den Browser zur Cacheverwerfung zu zwingen
	});
}

// Setzt das Bild im Editor auf das Standardbild zurück
function resetImage() {
	$("#editorImagePreview").attr("src","img/default.png");
}

// Setzt den Editor zurück
function resetEditor() {
	// Entfernt die ID aus debugIdDisplay und idStorage
	$("#debugIdDisplay").text("Id des ausgewählten Elements: ");
	$("#idStorage").text("");
	// Setzt Bild und Text zurück
	resetImage();
	$("#editorInputName").val("");
	$("#editorInputDescription").val("");
	// Setzt die Anzahl der verwendeten Zeichen zurück
	var maxlength = $("#editorInputDescription").attr("maxlength");
	var currentLength = $("#editorInputDescription").val().length;
	$('#charNum').text(currentLength+ "/" + maxlength );
}

// Lädt die Daten der Karte, bei der auf #editCard gedrückt wurde
function loadEditor(id) {
	var loadedCard = $( "p:contains(" +  id + ")").parent().parent();

	var img = loadedCard.find(".cardImage").attr("src");		// Bild
	var name = loadedCard.find(".cardName").text();				// Name
	var desc = loadedCard.find(".cardDesc").text();				// Beschreibung

	// Setzt oben definierte Werte in den Editor ein
	$("#editorImagePreview").attr("src",img);
	$("#editorInputName").val(name);
	$("#editorInputDescription").val(desc);

	// Aktualisiert die Anzahl der verwendeten Zeichen
	var maxlength = $("#editorInputDescription").attr("maxlength");
	var currentLength = $("#editorInputDescription").val().length;
	$('#charNum').text(currentLength+ "/" + maxlength );
}

// Speichern einer Kategorie in eine JSON-Datei
function saveCat(id,name) {
	// Preparation of JSON save
	var obj = JSON.parse(catSaveArray);							// Der JSON String wird in ein Objekt umgewandelt
	var time = $.now();											// Die aktuelle Zeit wird gespeichert
	// Falls noch keine Kategorie vorhanden ist, wird eine neue gepusht
	if ( jQuery.isEmptyObject(obj['cats']) ) {
		obj['cats'].push({"id":id,"name":name, "fav":"todo", "creationDate":time});	
	}
	// In der Theorie können hier mehrere Kategorien aktualisiert werden, da die uuids einzigartig sind, sollte Mehrfachspeicherung in der Praxis nicht vorkommen
	var counter = 0;											// counter dient der Überprüfung, ob die Kategorie bereits existiert
	$.each(obj['cats'], function(index, element) {				// Alle gespeicherten Kategorien werden durchlaufen
		if (element.id == id) {									// ID-Match
			counter++;										
			element.name = name;								// Name wird aktualisiert
			element.fav = "todo";								// Favorisiert-Status wird aktualisiert (TODO)
		}
	});
	// Wenn der Counter nach einem kompletten Durchlauf der Datei immer noch 0 ist, ist die zu speichernde Kategorie noch nicht vorhanden
	// Statt einer Aktualisierung wird daher auch hier eine neue Kategorie gepusht, wie im Fall eines leeren Arrays
	if (counter == 0) {
		obj['cats'].push({"id":id,"name":name, "fav":"todo", "creationDate":time});
	}

	catSaveArray = JSON.stringify(obj,null,4);					// Das JSON-Objekt wird wieder in Text umgewandelt und automatisch prettiefied
	log(catSaveArray,"d");
	saveToFile("cat", catSaveArray); 							// Der aktualisierte JSON-String wird in der JSON-Datei gespeichert
}

// Speichern einer Karte
function saveCard(id,cat,name,desc,time) {
	// Hier wird zuerst die tatsächliche HTML-Karte aktualisiert
	var savedCard = $( "p:contains(" +  id + ")").parent().parent();
	savedCard.find("img").attr("src",$("#editorImagePreview").attr("src"));
	var img = savedCard.find("img").attr("src");				// Der Bildpfad wird für die JSON-Datei in dieser Variable abgelegt
	savedCard.find(".cardName").text(name);
	savedCard.find(".cardDesc").text(desc);
	var pos = $( "p:contains(" +  id + ")").closest("#card").index();	// Wie bei updatePosition() wird auch hier der Index ausgelesen

	// Preparation of JSON save
	var obj = JSON.parse(cardSaveArray);						// Der JSON String wird in ein Objekt umgewandelt
	if ( jQuery.isEmptyObject(obj['cards']) ) {					// Falls noch keine Karte vorhanden ist, wird eine neue gepusht
		obj['cards'].push({"id":id,"cat":cat,"img":img,"name":name,"desc":desc,"pos":pos,"fav":"todo","creationDate":time});
	}
	// In der Theorie können hier mehrere Karten aktualisiert werden, da die uuids einzigartig sind, sollte Mehrfachspeicherung in der Praxis nicht vorkommen
	var counter = 0;											// counter dient der Überprüfung, ob die Karte bereits existiert
	$.each(obj['cards'], function(index, element) {				// Alle gespeicherten Karten werden durchlaufen
		if (element.id == id) {									// ID-Match
			counter++;
			element.cat = cat;									// Kategorie-ID wird aktualisiert
			element.img = img;									// Bildopfad wird aktualisiert
			element.name = name;								// Name wird aktualisiert
			element.desc = desc;								// Beschreibung wird aktualisiert
			element.pos = pos;									// Position wird aktualisiert
			element.fav = "todo";								// Favorisiert-Status wird aktualisiert (TODO)
		}
	});
	// Wenn der Counter nach einem kompletten Durchlauf der Datei immer noch 0 ist, ist die zu speichernde Karte noch nicht vorhanden
	// Statt einer Aktualisierung wird daher auch hier eine neue Karte gepusht, wie im Fall eines leeren Arrays
	if (counter == 0) {
		obj['cards'].push({"id":id,"cat":cat,"img":img,"name":name,"desc":desc,"pos":pos,"fav":"todo","creationDate":time});
	}

	cardSaveArray = JSON.stringify(obj,null,4);					// Das JSON-Objekt wird wieder in Text umgewandelt und automatisch prettiefied
	log(cardSaveArray,"d");
	saveToFile("card", cardSaveArray); 							// Der aktualisierte JSON-String wird in der JSON-Datei gespeichert
}

// Aktualisiert den Positionsparameter einer Karte in der JSON-Datei
function updatePosition() {
	// Preparation of JSON save
	var obj = JSON.parse(cardSaveArray);
	// Hier werden alle Karten ohne ID-Match durchlaufen, da bei Änderung eines Index alle anderen sich ebenfalls verschieben
	$.each(obj['cards'], function(index, element) {
			var pos = $( "p:contains(" +  element.id + ")").closest("#card").index();	// Index wird ausgelesen
			element.pos = pos;									// Position wird aktualisiert
		}
	);

	cardSaveArray = JSON.stringify(obj,null,4);					// Das JSON-Objekt wird wieder in Text umgewandelt und automatisch prettiefied
	log(cardSaveArray,"d");
	saveToFile("card", cardSaveArray); 							// Der aktualisierte JSON-String wird in der JSON-Datei gespeichert
}

// Löscht alle enthaltenen Karten, wenn die Elternkategorie gelöscht wird
function deleteContainedCards(catid) {
	// Preparation of JSON save
	var obj = JSON.parse(cardSaveArray);						// Der JSON String wird in ein Objekt umgewandelt

	// Hiervon sind zwei Durchläufe hintereinander nötig, da es vorkommen kann, dass sonst eine Karte übrig gelassen wird, je nach Anzahl der in der Datei enthaltenen Karten
	// Das liegt daran, dass array.splice die Länge des Arrays verändert und diese Änderung nicht an die JQuery each Funktion übergeben werden kann
	// Dies ist als unschöner Hack anzusehen, ich konnte jedoch keine bessere Lösung finden
	$.each(obj['cards'], function(index, element) {				// Alle Karten werden durchlaufen
		if (element !== undefined) {
			if (element.cat == catid) {							// ID-Match der ID der gelöschten Kategorie mit der abgespeicherten Kategorie-ID
				deleteThumb(element.id);						// Das zugehörige Thumbnail wird ebenfalls entferent
				var deletedItem = obj['cards'].splice(index,1);	// Die Karte wird aus dem JSON-Array gelöscht
			}
		}
	});
	$.each(obj['cards'], function(index, element) {
		if (element !== undefined) {
			if (element.cat == catid) {
				deleteThumb(element.id);
				var deletedItem = obj['cards'].splice(index,1);
			}
		}
	});

	cardSaveArray = JSON.stringify(obj,null,4);					// Das JSON-Objekt wird wieder in Text umgewandelt und automatisch prettiefied
	log(cardSaveArray,"d");
	saveToFile("card", cardSaveArray);							// Der aktualisierte JSON-String wird in der JSON-Datei gespeichert
}

// Speichert den übergebenen JSON String in der durch mode gewählten Datei
function saveToFile(mode,data) {
	switch (mode) {
		case "card":											// Karte
			var dirPath = path.join(app.getPath('documents'),'Corona');	// path.join wird als plattformübergreifende Methode verwendet, um Dateipfadseparatoren einzusetzen
			var filePath = path.join(dirPath, 'cards.json');	// Für die Karte wird in User/Dokumente/Corona/cards.json gespeichert

			// Falls nicht vorhanden, wird der Ordnerpfad erstellt 
			if (!fs.existsSync(dirPath)){
				fs.mkdirSync(dirPath);
			}
			// Datei wird geschrieben
			try {
				fs.writeFileSync(filePath, data);
				log("File saved: cards.json","s");
			} catch (error) {
				log("File save failed: cards.json","e");
			}
			break;
		case "cat":												// Kategorie
			var dirPath = path.join(app.getPath('documents'),'Corona');
			var filePath = path.join(dirPath, 'categories.json'); // Für die Kategorie wird in User/Dokumente/Corona/categories.json gespeichert
			
			// Falls nicht vorhanden, wird der Ordnerpfad erstellt 
			if (!fs.existsSync(dirPath)){
				fs.mkdirSync(dirPath);
			}
			// Datei wird geschrieben
			try {
				fs.writeFileSync(filePath, data);
				log("File saved: categories.json","s");
			} catch (error) {
				log("File save failed: categories.json","e");
			}
			break;
	}
}

// Gibt den Inhalt aus der mit Mode gewählten Datei zurück
function loadFromFile(mode) {
	switch (mode) {
		case "card":											// Karte
			// Wie beim Speichern wird mithilfe von path.join der Dateipfad zusammengesetzt
			var dirPath = path.join(app.getPath('documents'),'Corona');
			var filePath = path.join(dirPath, 'cards.json');
			// Datei wird gelesen
			try {
				var loadString = fs.readFileSync(filePath, 'utf8');
				log("File opened: cards.json","s");
				return loadString;								// Rückgabe des Inhalts
			} catch (error) {
				log("File open failed: cards.json","e");
			}
			break;
		case "cat":												// Kategorie
			var dirPath = path.join(app.getPath('documents'),'Corona');
			var filePath = path.join(dirPath, 'categories.json');
			// Datei wird gelesen
			try {
				var loadString = fs.readFileSync(filePath, 'utf8');
				log("File opened: categories.json","s");
				return loadString;								// Rückgabe des Inhalts
			} catch (error) {
				log("File open failed: categories.json","e");
			}
			break;
	}
}

// Baut aus den gespeicherten Dateien den benötigten HTML-DOM-Tree (verwendet Mustache)
function loadConstructor() {
	var startTime = Date.now();									// Dient dazu, nach Abschluss die Ladezeit debuggen zu können
	try {
		var catString = loadFromFile("cat");					// Lädt den Kategorie-JSON-String aus der Datei
		var cardString = loadFromFile("card");					// Lädt den Karten-JSON-String aus der Datei
		var catObj = JSON.parse(catString);						// Der JSON String wird in ein Objekt umgewandelt
		var cardObj = JSON.parse(cardString);					// Der JSON String wird in ein Objekt umgewandelt

		$.each(catObj['cats'], function(index, element) {		// Alle Kategorien werden durchlaufen
			var data = {
				id: element.id
			}
			var template = $("#cat-template").html();			// Das Template wird geladen
			var html = Mustache.render(template, data);			
			$("#categoryContainer").append(html);				// Der von Mustache vervollständigte HTML-Code wird in den Kategoriecontainer eingefügt
			
			var dad = $("#categoryContainer").find("p:contains(" +  data.id + ")").parent().parent();
			var catName = dad.find('.catName');
			catName.text(element.name);							// Der Kategoriename wird gesetzt
		});
		catSaveArray = catString;								// Die Runtime-Variable wird auf den geladenen JSON-String gesetzt, um damit weiterzuarbeiten

		$.each(cardObj['cards'], function(index, element) {		// Alle Karten werden durchlaufen
			var data = {
				id: element.id,
				pos: element.pos,								// pos wird hier direkt korrekt geladen, daher wird updatePosition() nicht benötigt
				time: element.creationDate				
			}
			var cat = element.cat;
			var template = $("#card-template").html();			// Das Template wird geladen
			var html = Mustache.render(template, data);
			var dad = $("#categoryContainer").find("p:contains(" +  cat + ")").parent().parent();
			dad.find("#cardContainer").append(html);			// Der von Mustache vervollständigte HTML-Code wird in den Kartencontainer eingefügt

			// Die gerade hinzugefügte Karte wird mit den gespeicherten Daten gefüllt
			var savedCard = $( "p:contains(" +  element.id + ")").parent().parent();
			savedCard.find("img").attr("src",element.img);
			savedCard.find(".cardName").text(element.name);
			savedCard.find(".cardDesc").text(element.desc);
		});
		cardSaveArray = cardString;								// Die Runtime-Variable wird auf den geladenen JSON-String gesetzt, um damit weiterzuarbeiten
		
		// Da es aufgrund der verwendeten JSON-Struktur sehr umständlich wäre, die geladenen JSON-Daten korrekt zu sortieren, wird stattdessen das Endprodukt umsortiert
		// Um jeweils die richtigen Divs in die richtigen Kategorien zu sortieren, wird pro Kategorie sortiert
		$.each(catObj['cats'], function(index, element) {		// Alle Kategorien werden durchlaufen
			var id = element.id;								// Holt die Kategorie-ID
			sortResults(id, "pos");								// Sortiert nach Indexposition
		});
		
		// Gibt die zum Laden benötigte Zeit aus
		var elapsedTime = Date.now() - startTime;
		elapsedTime = (elapsedTime / 1000).toFixed(3);
		log("Loading Done after " + elapsedTime + "s","s");
	} catch (error) {
		log("Fehler beim Konstruieren: " + error,"e");
	}
}

// Erstellt aus dem im File Dialog ausgewählten Bild ein Thumbnail
// Dies hat den Vorteil, dass das Bild nicht immer vom Browser verkleinert werden muss. Außerdem kann so auch die Originaldatei verschoben werden, ohne das Kartenbild zu verlieren
function createThumbnail(inputPath,id) {
	log(inputPath);
	var image = nativeImage.createFromPath(inputPath);			// NativeImage kann geladene Bilder manipulieren
	log("Image empty: " + image.isEmpty(),"d");
	image = image.resize({width: 200, height: 150});			// Verkleinert das Bild
	var buffer = image.toPNG();									// Wandelt das NativeImage zurück in einen PNG-Buffer um

	var dirPath = path.join(app.getPath('documents'),'Corona','thumbs');
	var filePath = path.join(dirPath, id + '.png');				// Für das Thumbnail ist der Speicherpfad User/Dokumente/Corona/thumbs/[id].png
	
	// Falls nicht vorhanden, wird der Ordnerpfad erstellt 
	if (!fs.existsSync(dirPath)){
		fs.mkdirSync(dirPath);
	}
	// Datei wird geschrieben 
	try {
		fs.writeFileSync(filePath, buffer);
		return filePath;
		log("File saved: " + id + ".png","s");
	} catch (error) {
		log("File save failed: " + id + ".png","e");
	}
}

// Löscht das Thumbnail mit der übergebenen ID als Namen
function deleteThumb(id) {
	var dirPath = path.join(app.getPath('documents'),'Corona','thumbs');
	var filePath = path.join(dirPath, id + ".png");

	// Falls die Datei existiert, wird sie gelöscht
	if (fs.existsSync(filePath)) {
		fs.unlink(filePath, (err) => {
			if (err) {
				alert("An error ocurred updating the file" + err.message);
				console.log(err);
				return;
			}
			log("Thumbnail " + id + ".png deleted","s");
		});
	} else {
		alert("The thumbnail file " + id + ".png doesn't exist, cannot delete");
	}
}

// Sortiert die nach dem Laden fertig eingefügten Karten-divs nach dem Positionsparameter
function sortResults(catId,mode) {
	var $divs = $("#categoryContainer").find("p:contains(" +  catId + ")").parent().parent().find("#cardContainer").find("div.card");
	var numericallyOrderedDivs;
	switch (mode) {												// Die Sortiermethode
		case "pos":												// Indexposition (Manuelle Sortierung)
			numericallyOrderedDivs = $divs.sort(function (a, b) {
				return $(a).find("#pos").text() - $(b).find("#pos").text();
			});
			break;
		case "nameUp":											// Alphabetisch A-Z
			numericallyOrderedDivs = $divs.sort(function (a, b) {
				if ($(a).find(".cardName").text() < $(b).find(".cardName").text()) return -1;
      			else if ($(a).find(".cardName").text() > $(b).find(".cardName").text()) return 1;
      			return 0;
			});
			break;
		case "nameDown":										// Alphabetisch Z-A
			numericallyOrderedDivs = $divs.sort(function (a, b) {
				if ($(a).find(".cardName").text() > $(b).find(".cardName").text()) return -1;
      			else if ($(a).find(".cardName").text() < $(b).find(".cardName").text()) return 1;
      			return 0;
			});
			break;
		case "time":											// Erstelldatum
			numericallyOrderedDivs = $divs.sort(function (a, b) {
				return $(a).find("#time").text() - $(b).find("#time").text();
			});
			break;
	}	
    $("#categoryContainer").find("p:contains(" +  catId + ")").parent().parent().find("#cardContainer").html(numericallyOrderedDivs);			// Hierbei wird der gesamte Inhalt von #cardContainer überschrieben, daher darf diese Funktion nur beim Laden aufgerufen werden
}