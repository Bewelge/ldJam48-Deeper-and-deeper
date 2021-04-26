window.onload = () => {
	loadImages()
}

function start() {
	// tick()
}
var money = 0
var lastTick = 0
var ticker = 0
var doneTicks = 0
var tickSpeed = 50
function tick() {
	var now = window.performance.now()
	var deltaTime = now - lastTick // amount of time elapsed since last tick

	lastTick = now

	ticker += deltaTime

	doneTicks = 0

	while (ticker > tickSpeed) {
		ticker -= tickSpeed
		doneTicks++
		if (doneTicks > 5) ticker = 0
		progress()
	}
	player.fuel -= 0.05
	if (player.fuel <= 0) {
		openScore()
		return
	}
	render()
	window.requestAnimationFrame(tick)
}

var screen = {
	width: width,
	height: height,
	x: -width / 2,
	y: -height / 2
}
function restart() {
	upClicked = false
	leftClicked = false
	downClicked = false
	rightClicked = false
	closeAllMenus()
	player.rotation = 0
	player.rotationSpeed = getPlayerManeuvrability()
	player.rotAcc = 0
	player.motion = { x: 0, y: 0 }
	player.position = { x: 0, y: -200 }
	player.health = 100
	player.lightRadius = getPlayerLight()
	player.speed = getPlayerSpeed()
	player.bSpeed = player.speed / 5
	player.path = []
	player.fuel = getMaxFuel()
	player.lowestElev = 0
	player.lowestElevEver = 0
	player.bag = []
	tick()
}
var player = {
	rotation: 0,
	rotationSpeed: getPlayerManeuvrability(),
	rotAcc: 0,
	motion: { x: 0, y: 0 },
	position: { x: 0, y: -200 },
	health: 100,
	lightRadius: getPlayerLight(),
	speed: getPlayerSpeed(),
	bSpeed: 0.1,
	path: [],
	fuel: getMaxFuel(),
	lowestElev: 0,
	lowestElevEver: 0,
	bag: [
		// "Turtle",
		// "Shark",
		// "Small Fish",
		// "Small Fish",
		// "Small Fish",
		// "Small Fish",
		// "Small Fish",
		// "Small Fish"
	]
}
openMain()
var pathTicker = 0
function progress() {
	updateRadar()
	spawnMobs()
	updateMobs()
	updatePlayer()
}
function updateRadar() {
	radarTicker = (radarTicker + 0.1) % (Math.PI * 2)

	// radarPoints = spawnedMobs
	// 	.filter(
	// 		mob =>
	// 			mob.disToPlayer < radarSize * 100 &&
	// 			mob.angToPlayer > prevAng - Math.PI &&
	// 			mob.angToPlayer <= radarTicker - Math.PI
	// 	)
	// 	.map(mob => ({
	// 		x: mob.position.x - player.position.x,
	// 		y: mob.position.y - player.position.y
	// 	}))
}
function updatePlayer() {
	if (player.dead) {
		return
	}

	if (upClicked) {
		player.motion.x -= player.speed * Math.cos(player.rotation)
		player.motion.y -= player.speed * Math.sin(player.rotation)
		player.fuel -= 1
	}
	if (downClicked) {
		player.motion.x += player.bSpeed * Math.cos(player.rotation)
		player.motion.y += player.bSpeed * Math.sin(player.rotation)
		player.fuel -= 1
	}
	if (leftClicked) {
		player.rotAcc -= player.rotationSpeed
	}
	if (rightClicked) {
		player.rotAcc += player.rotationSpeed
	}

	//Gravity
	if (player.position.y < 0) {
		player.motion.y += 0.4
	} else {
		player.motion.y += 0.05
	}

	moved = false
	player.rotation += player.rotAcc
	player.position.x += player.motion.x
	player.position.y += player.motion.y

	if (player.position.x - player.width / 2 < -2000) {
		player.position.x = -2000 + player.width / 2
	}
	if (player.position.x + player.width / 2 > 2000) {
		player.position.x = 2000 - player.width / 2
	}
	// if (player.position.y < 0) {
	// 	player.position.y = 0
	// }
	if (player.position.y + player.height / 2 > 11000 * 25) {
		player.position.y = 11000 * 25 - player.height / 2
	}

	if (player.path.length > 50) {
		player.path.splice(0, 1)
	} else {
		if (player.motion.x != 0 || player.motion.y != 0 || player.rotAcc != 0) {
			pathTicker++
			if (pathTicker > 10) {
				pathTicker = 0
				player.path.push([
					player.position.x + 20 * Math.cos(player.rotation),
					player.position.y + 20 * Math.sin(player.rotation),
					200
				])
			}
		}
	}
	for (let key = player.path.length - 1; key >= 0; key--) {
		player.path[key][2]--
		if (player.path[key][2] <= 0) {
			player.path.splice(key, 1)
		}
	}

	player.rotAcc *= 0.96
	if (Math.abs(player.rotAcc) < 0.001) {
		player.rotAcc = 0
	}
	player.motion.x *= 0.9
	if (Math.abs(player.motion.x) < 0.0001) {
		player.motion.x = 0
	}
	player.motion.y *= player.position.y < 0 ? 0.9999 : 0.9
	if (Math.abs(player.motion.y) < 0.0001) {
		player.motion.y = 0
	}

	player.lowestElev = Math.max(player.lowestElev, player.position.y)

	spawnedMobs.forEach(mob => {
		if (
			mob.disToPlayer <
			player.width / 2 + Math.max(mob.width, mob.height) / 2
		) {
			player.bag.push(mob.key)
			if (mob.key == "Plastic Bag") {
				openEnd()
			}
			mob.dead = true
		}
	})
}

window.addEventListener("keydown", keyDownListener)
window.addEventListener("keyup", keyUpListener)

var moved = false
var anyMerge = false

var leftClicked = false
var rightClicked = false
var upClicked = false
var downClicked = false
function keyUpListener(e) {
	if (e.key == "ArrowDown" || e.key.toLocaleLowerCase() == "s") {
		downClicked = false
	} else if (e.key == "ArrowUp" || e.key.toLocaleLowerCase() == "w") {
		upClicked = false
	} else if (e.key == "ArrowLeft" || e.key.toLocaleLowerCase() == "a") {
		leftClicked = false
	} else if (e.key == "ArrowRight" || e.key.toLocaleLowerCase() == "d") {
		rightClicked = false
	}
}
function keyDownListener(e) {
	if (e.key == "ArrowDown" || e.key.toLocaleLowerCase() == "s") {
		downClicked = true
		moved = true
	} else if (e.key == "ArrowUp" || e.key.toLocaleLowerCase() == "w") {
		upClicked = true
		moved = true
	} else if (e.key == "ArrowLeft" || e.key.toLocaleLowerCase() == "a") {
		leftClicked = true
		moved = true
	} else if (e.key == "ArrowRight" || e.key.toLocaleLowerCase() == "d") {
		rightClicked = true
		moved = true
	}
}

var ctx
var ctx2
function setupCanvases() {
	let cnv = DomHelper.createCanvas(width, height)
	document.body.appendChild(cnv)
	cnv.id = "mainCanvas"
	ctx = cnv.getContext("2d")

	let cnv2 = DomHelper.createCanvas(width, height)
	document.body.appendChild(cnv2)
	cnv2.style.zIndex = 10000
	ctx2 = cnv2.getContext("2d")
	beginningTick()
}
var beginningTicker = 0
function beginningTick() {
	if (beginningTicker < 250) {
		beginningTicker++
		ctx2.clearRect(0, 0, width, height)
		ctx2.save()
		let ratio = beginningTicker / 250
		ctx2.translate(width - (width / 2) * ratio, height - (height / 2) * ratio)
		ctx2.rotate(((beginningTicker / 10) % Math.PI) * 2)
		ctx2.drawImage(
			imgs["newspaper"].img,
			-imgs["newspaper"].width / 2,
			-imgs["newspaper"].height / 2
		)
		ctx2.restore()
		window.requestAnimationFrame(beginningTick)
		return
	}
	document.querySelector(".wrapper .title").style.opacity = 1
	document.querySelector(".wrapper .subTitle").style.opacity = 1
	document.querySelector(".wrapper .bottomTitle").style.opacity = 1

	let closeListener = ev => {
		restart()
		document.body.removeChild(ctx2.canvas)
		window.removeEventListener("click", closeListener)
	}
	window.setTimeout(() => {
		window.addEventListener("click", closeListener)
	}, 1000)
}
