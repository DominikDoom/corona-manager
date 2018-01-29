$(document).ready(function(){
  $("#addbutton").click(function(){
		var data = {
			id: uuidv4()
		}
		var template = $("#card-template").html();
		console.log(template);		
		var html = Mustache.render(template, data);
		$("#categorycontainer").append(html);
		console.log("added");
	});
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}