function sprintf() {
	var ret = "";
	var param = 1; // maps to first %
	msg = arguments[0];
	for (var i=0; i<msg.length; i++) {
		if (msg[i] == "%") {
			// %% will be printed as normal %
			if (msg[i+1] == "%") {
				ret += "%";
				i++;
			} else
				ret += arguments[param++];
		} else {
			ret += msg[i];
		}
	}
	return ret;
}

function printf() {
	var ret = "";
	var param = 1; // maps to first %
	msg = arguments[0];
	for (var i=0; i<msg.length; i++) {
		if (msg[i] == "%") {
			// %% will be printed as normal %
			if (msg[i+1] == "%") {
				ret += "%";
				i++;
			} else
				ret += arguments[param++];
		} else {
			ret += msg[i];
		}
	}
	imgui_log(ret);
	return ret.length;
}