function Vec3(x, y, z) {
	var ret = new Float32Array(3);
	ret[0] = x;
	ret[1] = y;
	ret[2] = z;
	return ret;
}

Float32Array.prototype.mul = function(scalar) {
	return Vec3(this[0] * scalar, this[1] * scalar, this[2] * scalar);
}

Float32Array.prototype.add = function(other) {
	return Vec3(this[0] + other[0], this[1] + other[1], this[2] + other[2]);
}
Float32Array.prototype.sub = function(other) {
	return Vec3(this[0] - other[0], this[1] - other[1], this[2] - other[2]);
}

// not allowed to redefine those, so just add them once
if (Float32Array.prototype.hasOwnProperty("x") == false) {
	Object.defineProperty(Float32Array.prototype, "x", {
		get: function (   ) { return this[0]      ; },
		set: function (tmp) { return this[0] = tmp; }
	});
	Object.defineProperty(Float32Array.prototype, "y", {
		get: function (   ) { return this[1]      ; },
		set: function (tmp) { return this[1] = tmp; }
	});
	Object.defineProperty(Float32Array.prototype, "z", {
		get: function (   ) { return this[2]      ; },
		set: function (tmp) { return this[2] = tmp; }
	});

	Object.defineProperty(Float32Array.prototype, "mag", {
		get: function () {
			return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
		}
	});
}

Float32Array.prototype.toString = function() {
	return "Vec3(" + this[0] + ", " + this[1] + ", " + this[2] + ")";
}

vecToAngles = function(vec) {
	return vec2angles(vec.x, vec.y, vec.z)
}

distance = function(a, b) {
	var dx = b.x - a.x;
	var dy = b.y - a.y;
	var dz = b.z - a.z;
	return Math.sqrt(
		(dx*dx) + 
		(dy*dy) +
		(dz*dz)
	);
}