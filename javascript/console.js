
Console = function () { /**/ }

Console.prototype.log = function () {
	for (var i = 0; i < arguments.length; i++) {
		imgui_log(arguments[i]);
		imgui_log(" ");
	}
	imgui_log("\n");
}

if (typeof console == "undefined")
	console = new Console();
