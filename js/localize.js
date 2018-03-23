// Initialize language data
var en = {
    catName: "Name",
    editCatInfo: "(Click to edit)",
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
    autoSortButton: "Enable / disable automatic sorting"
}
var de = {
    catName: "Name",
    editCatInfo: "(Klicken zum Ändern)",
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
    autoSortButton: "Auto-Sortierung an- / ausschalten"
}

var currentLang = "en";

function switchLang(lang) {
    var localizable = $(document).find(".loc");
    switch (lang) {
        case "en":
            $.each(localizable, function(index, element) {
                if (typeof $(element).attr("title") !== typeof undefined || typeof $(element).attr("data-tippy") !== typeof undefined) {
                    var langString = $(element).attr("loc");
                    langString = langString.substr(1);
                    $(element).attr("title",en[langString]);
                } else {
                    var langString = $(element).attr("loc");
                    langString = langString.substr(1);
                    $(element).text(en[langString]);
                }
                $(element).addClass("loc-en");
                $(element).removeClass("loc-de");
            });
            currentLang = "en";
            break;
    
        case "de":
            $.each(localizable, function(index, element) {
                if (typeof $(element).attr("title") !== typeof undefined || typeof $(element).attr("data-tippy") !== typeof undefined) {
                    var langString = $(element).attr("loc");
                    langString = langString.substr(1);
                    $(element).attr("title",de[langString]);
                } else {
                    var langString = $(element).attr("loc");
                    langString = langString.substr(1);
                    $(element).text(de[langString]);
                }
                $(element).addClass("loc-de");
                $(element).removeClass("loc-en");
            });
            currentLang = "de";
            break;
    }
}
