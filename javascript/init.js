function require(filename) {
	var content = file_get_contents(filename);
	try {
		eval.bind(get_global())(content);
	} catch (e) {
		printf("require(%): error %\n", filename, e.stack);
	}
}

function require_jidaiscript(filename) {
	var content = file_get_contents(filename);
	try {
		content = jidaiScript.compile(content) // just transpile from js->ji
		eval.bind(get_global())(content);
	} catch (e) {
		printf("require(%): error %\n", filename, e.stack);
	}
}

require("./javascript/printf.js")
require("./javascript/console.js")
require("./javascript/entity.js")
require("./javascript/Vec3.js")
require("./javascript/String.js")
require("./javascript/Number.js")
require("./javascript/Acorn.js")
require("./javascript/JidaiScript.js")
require("./javascript/Thread.js")
require("./javascript/Astar.js")
require("./javascript/Heap.js")
require("./javascript/Waypoints.js")

if (typeof acorn == "undefined") {
	acorn = new Acorn()
	jidaiScript = new JidaiScript()
	
	// for easy js_call(ctx, "eval_jidai", "s", code)
	eval_jidai = function(code) {
		return jidaiScript.eval(code)
	}
}

require_jidaiscript("./jidaiscript/stuff.ji")

if (typeof level == "undefined") {
	level = {};
	level.time = 0;
}

repl_javascript = function (code, sel_from, sel_to) {
	if (sel_to < sel_from) {
		tmp = sel_to;
		sel_to = sel_from;
		sel_from = tmp;

	}
	if (sel_from != sel_to)
		code = code.substr(sel_from, sel_to - sel_from);
	//printf("code: % % %", code, sel_from, sel_to);
	handle_input(code, get_global());
}

repl_jidaiscript = function (code, sel_from, sel_to) {
	if (sel_to < sel_from) {
		tmp = sel_to;
		sel_to = sel_from;
		sel_from = tmp;

	}
	if (sel_from != sel_to)
		code = code.substr(sel_from, sel_to - sel_from);
	//printf("code: % % %", code, sel_from, sel_to);
	code = jidaiScript.compile(code)
	handle_input(code, get_global());
}

print = function () {
	for (var i = 0; i < arguments.length; i++) {
		imgui_log(arguments[i]);
	}
}

var_dump = function (ret) {
	switch (typeof ret) {
		case "number": {
			print("ret = ", ret, ";");
			break;
		}
		case "string": {
			print("ret = \"", ret, "\";");
			break;
		}
		case "function": {
			// print infos like byte codes or length of byte codes
			print("Function: ", ret);
			break;
		}
		case "boolean": {
			print("ret = ", ret, ";");
			break;
		}
		case "object": {
			if (ret.constructor.name == "Float32Array") {
				print(ret.toString());
				break;
			}
			if (ret.constructor.name == "Array") {

				print("ret = [\n");
				for (var i = 0; i < ret.length; i++) {
					if (typeof ret[i] == "object")
						printf("\t%: % {...},\n", i, ret[i].constructor.name);
					else
						printf("\t%: %,\n", i, ret[i]);
				}
				print("];\n");
			}

			// An array still can have properties, so print them aswell:
			{
				printf("% {\n", ret.constructor.name);
				for (var i in ret) {
					if (typeof ret[i] == "object")
						printf("\t%: % {...},\n", i, ret[i].constructor.name);
					else
						printf("\t%: %,\n", i, ret[i]);
				}
				print("};\n");
			}
			break;
		}
		case "undefined": {
			// print infos like byte codes or length of byte codes
			print("undefined;");
			break;
		}
		default:
			print("Unhandled type: ", typeof ret);
	}

}

handle_input = function (code, global) {
	try {
		var ret = eval.bind(global)(code);

		imgui_log("> ");
		var_dump(ret);
		imgui_log("\n");

	} catch (e) {
		print("handle_input> error: ", e.stack, "\n");
	}
}

print("init.js loaded :^)\n");

frame = function() {
	Com_BusyWait();
	Com_Frame();
}

main = function() {
	while (1) {
		frame()
	}
}

