/*
 * Paper.js v0.11.5 - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 * Copyright (c) 2011 - 2016, Juerg Lehni & Jonathan Puckey
 * http://scratchdisk.com/ & http://jonathanpuckey.com/
 * Distributed under the MIT license. See LICENSE file for details.
 * All rights reserved.
 * Date: Thu Oct 5 16:16:29 2017 +0200
 */

JidaiScript = function() {
	this.binaryOperators = {
		'+': 'add',
		'-': 'sub',
		'*': 'mul',
		'/': 'div',
		'%': 'mod',
		'==': 'eq',
		'!=': 'neq'
	};

	this.unaryOperators = {
		'-': 'neg',
		'+': 'self'
	};

	function __$__(left, operator, right) {
		var handler = binaryOperators[operator];
		if (left && left[handler]) {
			var res = left[handler](right);
			return operator === '!=' ? !res : res;
		}
		switch (operator) {
		case '+': return left + right;
		case '-': return left - right;
		case '*': return left * right;
		case '/': return left / right;
		case '%': return left % right;
		case '==': return left == right;
		case '!=': return left != right;
		}
	}
}

JidaiScript.prototype.parse = function(code) {
	return acorn.parse(code, { ranges: true, preserveParens: true });
}

JidaiScript.prototype.compile = function(code) {
	var insertions = [];
	var self = this;
	
	function getOffset(offset) {
		for (var i = 0, l = insertions.length; i < l; i++) {
			var insertion = insertions[i];
			if (insertion[0] >= offset)
				break;
			offset += insertion[1];
		}
		return offset;
	}

	function getCode(node) {
		return code.substring(getOffset(node.range[0]),
				getOffset(node.range[1]));
	}

	function getBetween(left, right) {
		return code.substring(getOffset(left.range[1]),
				getOffset(right.range[0]));
	}

	function replaceCode(node, str) {
		var start = getOffset(node.range[0]),
			end = getOffset(node.range[1]),
			insert = 0;
		for (var i = insertions.length - 1; i >= 0; i--) {
			if (start > insertions[i][0]) {
				insert = i + 1;
				break;
			}
		}
		insertions.splice(insert, 0, [start, str.length - end + start]);
		code = code.substring(0, start) + str + code.substring(end);
	}

	function walkAST(node, parent) {
		if (!node)
			return;
		for (var key in node) {
			if (key === 'range' || key === 'loc')
				continue;
			var value = node[key];
			if (Array.isArray(value)) {
				for (var i = 0, l = value.length; i < l; i++)
					walkAST(value[i], node);
			} else if (value && typeof value === 'object') {
				walkAST(value, node);
			}
		}
		switch (node.type) {
		case 'UnaryExpression':
			if (node.operator in self.unaryOperators && node.argument.type !== 'Literal') {
				var arg = getCode(node.argument);
				//console.log("unary operator: ", node.operator)
				var methodName = self.unaryOperators[node.operator];
				replaceCode(node, arg + '.' + methodName + '()');
			}
			break;
		case 'BinaryExpression':
			if (node.operator in self.binaryOperators && node.left.type !== 'Literal') {
				var left = getCode(node.left),
					right = getCode(node.right),
					//between = getBetween(node.left, node.right),
					operator = node.operator;
				var methodName = self.binaryOperators[operator]
				//console.log("Replacing: ", operator);
				//console.log("between", between) // seems to be only operators like "+" or "+="
				replaceCode(
					node,
					left + '.' + methodName + '(' + right + ')'
				);
			}
			break;
		case 'UpdateExpression':
		case 'AssignmentExpression':
			var parentType = parent && parent.type;
			if (!(
					parentType === 'ForStatement'
					|| parentType === 'BinaryExpression'
						&& /^[=!<>]/.test(parent.operator)
					|| parentType === 'MemberExpression' && parent.computed
			)) {
				if (node.type === 'UpdateExpression') {
					var arg = getCode(node.argument),
						exp = '__$__(' + arg + ', "' + node.operator[0] + '", 1)',
						str = arg + ' = ' + exp;
					if (!node.prefix
							&& (parentType === 'AssignmentExpression'
								|| parentType === 'VariableDeclarator')) {
						if (getCode(parent.left || parent.id) === arg)
							str = exp;
						str = arg + '; ' + str;
					}
					replaceCode(node, str);
				} else {
					
					//console.log("node.operator: ", node.operator)
					// regex checks for random first char and '=' as second
					if (/^.=$/.test(node.operator) && node.left.type !== 'Literal') {
						var left = getCode(node.left);
						var right = getCode(node.right);
						var operator = node.operator[0]; // "+="[0] is simply "+"
						var methodName = self.binaryOperators[operator]; // translate "+" into "add" e.g.
						//var exp = left + ' = __$__(' + left + ', "' + node.operator[0] + '", ' + right + ')';
						var exp = left + ' = ' + left + '.' + methodName + '(' + right + ')';
						replaceCode(node, /^\(.*\)$/.test(getCode(node)) ? '(' + exp + ')' : exp);
					}
				}
			}
			break;
		}
	}
	
	this.last_parse_result = this.parse(code);
	walkAST(this.last_parse_result);
	return code;
}

JidaiScript.prototype.eval = function(code) {
	this.last_generated_js = this.compile(code);
	//this.last_generated_func = Function(/*params*/[], this.last_generated_js);
	//return this.last_generated_func.apply(scope, /*args*/[]);
	return eval.bind(get_global())(this.last_generated_js);
}
