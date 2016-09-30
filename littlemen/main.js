(function () {

	var man;

	function log(text) {
		var e = document.getElementById("logOutput");
		e.innerHTML += (text + "<br/>");
	};

	function moveMan(eventInfo) {
		var tX = eventInfo.clientX - man.getWidth() / 2;
		var tY = eventInfo.clientY - man.getHeight() / 2;

		if (tX < man.getX()) {
			man.flip(true, false);
			//man.flipX(true);
		}
		else if (tX > man.getX()) {
			man.flip(false, false);
			//man.flipX(false);
		}

		var time = man.distanceTo(tX, tY) * 0.01;

		man.moveTo(tX, tY, time);
	};

	document.addEventListener("DOMContentLoaded", function () {
		log("Hello World!!");

		document.body.addEventListener("mousemove", moveMan);

		man = new Sprite("elephant", document.body);
		man.moveTo((document.body.clientWidth - man.getWidth()) / 2, (document.body.clientHeight - man.getHeight()) / 2, 0);
	});
})();
