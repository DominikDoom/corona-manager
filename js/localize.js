// Initialize language data
// This will later be expandable or moved to a file, but during development de and en will be the only languages available
var en = {
    catDefaultName: "Name",
    editInfo: "(Click to edit)",
    addCard: "Add a card",
    deleteCat: "Delete category",
    openCard: "Open card",
    editCard: "Edit card",
    upCard: "Move up",
    downCard: "Move down",
    dialogBoxTitle: "Confirm deletion",
    dialogNo: "No",
    dialogYes: "Yes",
    editorSave: "Save",
    editorCancel: "Cancel",
    debugIdLabel: "Id of selected card: ",
    editorInputName: "Name",
    editorInputDesc: "Description",
    editorImageSelectText: "Select an image",
    editorImageSelectTTip: "Open image",
    editorImageReset: "Reset image",
    editorAdvanced: "Advanced",
    removeCard: "Remove this card",
    addCat: "Add a category",
    viewIconsLabel: "View",
    cardViewButton: "Card view",
    listViewButton: "List view",
    sortIconsLabel: "Sorting method",
    alphaSortButton: "Alphabetic",
    dateSortButton: "Creation date",
    autoSortLabel: "Auto-sorting",
    autoSortButton: "Enable / disable automatic sorting",
    pinboardSave: "Save project",
    pinboardCancel: "Cancel editing",
    toolboxTitle: "Drag object to add it to the pinboard",
    pinboardObjectTitle: "Title",
    editPinboardObject: "Edit",
    deletePinboardObject: "Delete",
    mdPreviewTitle: "Preview"
}
var de = {
    catDefaultName: "Name",
    editInfo: "(Klicken zum Ändern)",
    addCard: "Karte hinzufügen",
    deleteCat: "Kategorie löschen",
    openCard: "Karte öffnen",
    editCard: "Karte bearbeiten",
    upCard: "Nach oben",
    downCard: "Nach unten",
    dialogBoxTitle: "Wirklich löschen?",
    dialogNo: "Nein",
    dialogYes: "Ja",
    editorSave: "Speichern",
    editorCancel: "Abbrechen",
    debugIdLabel: "Id der ausgewählten Karte: ",
    editorInputName: "Name",
    editorInputDesc: "Beschreibung",
    editorImageSelectText: "Bild auswählen",
    editorImageSelectTTip: "Bild öffnen",
    editorImageReset: "Bild zurücksetzen",
    editorAdvanced: "Erweitert",
    removeCard: "Karte entfernen",
    addCat: "Kategorie hinzufügen",
    viewIconsLabel: "Ansicht",
    cardViewButton: "Karten",
    listViewButton: "Liste",
    sortIconsLabel: "Sortiermethode",
    alphaSortButton: "Alphabetisch",
    dateSortButton: "Erstelldatum",
    autoSortLabel: "Auto-Sortierung",
    autoSortButton: "Auto-Sortierung an- / ausschalten",
    pinboardSave: "Projekt speichern",
    pinboardCancel: "Bearbeiten abbrechen",
    toolboxTitle: "Objekt ziehen, um es hinzuzufügen",
    pinboardObjectTitle: "Titel",
    editPinboardObject: "Ändern",
    deletePinboardObject: "Löschen",
    mdPreviewTitle: "Vorschau"
}

// Initializes currentLang with en, making it the standard language
var currentLang = "en";

// switchLang is responsible for replacing the text of each element with the "loc" class 
function switchLang(lang) {
    var localizable = $(document).find(".loc");                 // Finds all elements with the loc class
    var langData;                                               // langData gets filled with the data of the selected language to keep the switch-case small 

    switch (lang) {
        case "en":
            langData = en;
            currentLang = "en";
            $.each(localizable, function(index, element) {      // Adds the class for the current language (used to adjust css) to each loc element
                $(element).addClass("loc-en");
                $(element).removeClass("loc-de");
            });
            break;
    
        case "de":
            langData = de;
            currentLang = "de";
            $.each(localizable, function(index, element) {      // Adds the class for the current language (used to adjust css) to each loc element
                $(element).addClass("loc-de");
                $(element).removeClass("loc-en");
            });
            break;
    }

    // The real translation process
    $.each(localizable, function(index, element) {
        
        // The following if-clause tests for the title or tippy attribute to check if the targeted element is a tooltip text or plaintext
        if (typeof $(element).attr("title") !== typeof undefined || typeof $(element).attr("data-tippy") !== typeof undefined) {    // Tooltip
            var langString = $(element).attr("loc");
            langString = langString.substr(1);                  // Language text have ? as a prefix to make identification in the HTML easier, this strips it
            $(element).attr("title",langData[langString]);
        } else {                                                // Plaintext                         
            var langString = $(element).attr("loc");
            langString = langString.substr(1);
            $(element).text(langData[langString]);
        }   
    });
}

function localizeElement(element, lang) {
    var localizable = $(element).find(".loc");                  // Finds all elements with the loc class in the specified element group

    var langData;                                               // langData gets filled with the data of the selected language to keep the switch-case small 

    switch (lang) {
        case "en":
            langData = en;
            currentLang = "en";
            $.each(localizable, function(index, element) {      // Adds the class for the current language (used to adjust css) to each loc element
                $(element).addClass("loc-en");
                $(element).removeClass("loc-de");
            });
            break;
    
        case "de":
            langData = de;
            currentLang = "de";
            $.each(localizable, function(index, element) {      // Adds the class for the current language (used to adjust css) to each loc element
                $(element).addClass("loc-de");
                $(element).removeClass("loc-en");
            });
            break;
    }

    // The real translation process
    $.each(localizable, function(index, element) {
        // The following if-clause tests for the title or tippy attribute to check if the targeted element is a tooltip text or plaintext
        if (typeof $(element).attr("title") !== typeof undefined || typeof $(element).attr("data-tippy") !== typeof undefined) {    // Tooltip
            var langString = $(element).attr("loc");
            langString = langString.substr(1);                  // Language text have ? as a prefix to make identification in the HTML easier, this strips it
            $(element).attr("title",langData[langString]);
        } else {                                                // Plaintext
            var langString = $(element).attr("loc");
            langString = langString.substr(1);
            $(element).text(langData[langString]);
        }   
    });
}
