reelo = spawnNPC("reelo")
chewbacca = spawnNPC("chewbacca")

killthreads()

reelo.thread( function() {
	while (1) {
		var dist = distance(player.origin, reelo.origin)
		if (dist < 100) {
			reelo.sit()
		} else {
			reelo.walkTo( player.origin )
		}
		wait(1)
	}
} )()

chewbacca.thread( function() {
	while (1) {
		var dist = distance(player.origin, chewbacca.origin)
		if (dist < 200) {
			chewbacca.crouch()
		} else {
			chewbacca.walkTo( player.origin )
		}
		wait(0.5)
	}
} )()
