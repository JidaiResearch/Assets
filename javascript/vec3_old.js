function Vec3(x,y,z) {
	var ret = new Float32Array(3);
	ret[0] = x;
	ret[1] = y;
	ret[2] = z;
	return ret;
}


// todo: player0.origin += player0.forward * 200
// player0.origin = player0.origin.add( player0.forward.scale(200) )

Float32Array.prototype.scale = function(scalar) {
	return Vec3(this[0] * scalar, this[1] * scalar, this[2] * scalar);
}

Float32Array.prototype.add = function(other) {
	return Vec3(this[0] + other[0], this[1] + other[1], this[2] + other[2]);
}

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


function vec3_new() {
	return new Float32Array(3);
}

function vec3_scale(vec, scalar, output) {
	output[0] = vec[0] * scalar;
	output[1] = vec[1] * scalar;
	output[2] = vec[2] * scalar;
}
function vec3_copy(from_, to) {
	to[0] = from_[0];
	to[1] = from_[1];
	to[2] = from_[2];
}
function vec3_add(a, b, c) {
	c[0] = a[0] + b[0];
	c[1] = a[1] + b[1];
	c[2] = a[2] + b[2];
}
function vec3_sub(a, b, ret) {
  ret[0] = a[0] - b[0];
  ret[1] = a[1] - b[1];
  ret[2] = a[2] - b[2];
}




function vec3_a_is_b_times_c(output, vec, scalar) {
	output[0] = vec[0] * scalar;
	output[1] = vec[1] * scalar;
	output[2] = vec[2] * scalar;
}
function vec3_a_is_b(to, from_) {
	to[0] = from_[0];
	to[1] = from_[1];
	to[2] = from_[2];
}
function vec3_a_is_b_plus_c(a, b, c) {
	a[0] = b[0] + c[0];
	a[1] = b[1] + c[1];
	a[2] = b[2] + c[2];
}
function vec3_a_is_b_minus_c(a, b, c) {
  a[0] = b[0] - c[0];
  a[1] = b[1] - c[1];
  a[2] = b[2] - c[2];
}
function vec3_a_is_b_plus_c_times_d(ret, eye, forward, distance) {
	ret[0] = eye[0] + forward[0] * distance;
	ret[1] = eye[1] + forward[1] * distance;
	ret[2] = eye[2] + forward[2] * distance;
}




// vec3_sub always fucks my brain to remember the order, this functions makes it VERY clear
// it calculates the delta vector from "from_" to "to" into "ret"
// calculating the vector "a to b" is "b minus a"
function vec3_fromtoret(from_, to, ret) {
	ret[0] = to[0] - from_[0];
	ret[1] = to[1] - from_[1];
	ret[2] = to[2] - from_[2];
}
function vec3_length(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}
function vec3_distance(a, b) {
  var delta = vec3_new();
  vec3_sub(b, a, delta);
  return vec3_length(delta);
}
function vec3_distancesquared(a, b) {
  var delta = vec3_new();
  vec3_sub(b, a, delta);
  return delta[0] * delta[0] + delta[1] * delta[1] + delta[2] * delta[2];
}


function vec3_ret_a_plus_b(a, b) {
	var tmp = vec3_new();
	vec3_a_is_b_plus_c(tmp, a, b);
	return tmp;
}