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
		if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().parent().remove();
			console.log("removed");
		}
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
		if (confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
			$(this).parent().remove();
			console.log("removed");
		}
	});
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
