var width = 700
var height = 700

function render() {
	ctx.font = "24px Arial black"
	ctx.clearRect(0, 0, width, height)

	drawSky()
	drawOcean()

	ctx.save()
	clipOcean()
	// ctx.filter = "blur(5px)"
	ctx.fillStyle = "#002650"
	ctx.fillRect(0, 0, width, height)
	ctx.restore()

	ctx.save()
	clipLightOcean()
	ctx.fillStyle = "rgba(0,0,0,0)"
	ctx.fillRect(0, 0, width, height)
	ctx.restore()

	drawPlayer()

	ctx.save()
	clipOcean()
	// ctx.filter = "blur(10px)"
	ctx.fillStyle = "rgba(250,250,250,0.2)"
	ctx.beginPath()

	doLightPath()
	ctx.closePath()
	ctx.fill()
	ctx.filter = "none"
	ctx.restore()

	ctx.save()
	clipLight()
	drawMobs()
	ctx.restore()
	createAndRenderBubbles()
	drawBorders()

	drawRadar()
	drawFuel()

	drawDepth()
}
var bubbles = []
var maxBubbles = 50
function createAndRenderBubbles() {
	bubbles.forEach(bubble => (bubble.y -= bubble.speed))
	bubbles = bubbles.filter(
		bubble => bubble.y > player.position.y - height / 2 || bubble.y > 0
	)
	ctx.fillStyle = "rgba(125,125,255,0.7)"
	ctx.beginPath()
	bubbles.forEach(bubble => {
		let x = width / 2 + bubble.x - player.position.x
		let y = height / 2 + bubble.y - player.position.y
		ctx.moveTo(x, y)
		ctx.arc(x, y, bubble.rad, 0, Math.PI * 2, 0)
	})
	ctx.fill()
	ctx.closePath()

	for (let i = 0; i < maxBubbles - bubbles.length; i++) {
		if (Math.random() < 0.002 / bubbles.length) {
			bubbles.push({
				x: Math.random() * width * 0.6 + player.position.x - width * 0.3,
				y: player.position.y + width / 1.8,
				speed: 0.3 + Math.random() * 0.3,
				rad: 4 + Math.random() * 5
			})
		}
	}
}
function drawFuel() {
	ctx.strokeStyle = "rgba(40,225,40,1)"
	ctx.fillStyle = "rgba(40,225,40,1)"
	ctx.font = "20px fantasy"
	ctx.lineWidth = 4
	ctx.fillText("Fuel", 47, 150 - 20)
	ctx.strokeRect(45, 150, 40, 400)

	let h = (400 * player.fuel) / getMaxFuel()
	ctx.fillRect(45, 150 + 400 - h, 40, h)
}
function drawDepth() {
	ctx.font = "20px fantasy"
	let h = height - 300
	let y = 150
	ctx.fillText("Elevation", width - 120, y - 20)
	ctx.fillText(
		roundToDecimals((-1 * player.position.y) / 25, 0) + "m",
		width - 120,
		y + (h * player.position.y) / 25 / 11000
	)
	ctx.strokeStyle = "rgba(40,225,40,1)"
	ctx.fillStyle = "rgba(40,225,40,1)"
	ctx.font = "20px fantasy"
	ctx.lineWidth = 4
	ctx.strokeRect(width - 60, y, 20, h)

	for (let i = 0; i < 11000; i += 1000) {
		ctx.beginPath()
		ctx.moveTo(width - 60, y + (h * i) / 11000)
		ctx.lineTo(width - 50, y + (h * i) / 11000)
		ctx.stroke()
		ctx.closePath()
	}

	ctx.beginPath()
	ctx.moveTo(width - 60, y + (h * player.position.y) / 25 / 11000)
	ctx.lineTo(width - 45, y + (h * player.position.y) / 25 / 11000)
	ctx.stroke()
	ctx.closePath()
}
var radarTicker = 0
var radarRingDistance = 200
var radarPxSize = 80
function clipLight() {
	ctx.beginPath()

	doLightPath()
	ctx.closePath()

	ctx.clip()
}
function doLightPath() {
	let jitter = getJitter()
	ctx.translate(width / 2 + jitter.x, height / 2 + jitter.y)
	ctx.rotate(player.rotation)

	ctx.arc(-43, -42, player.lightRadius / 17 + 30, 0, Math.PI * 2, 0)
	let sin = Math.sin(player.rotation)
	let cos = Math.cos(player.rotation)
	let x = -43
	let y = -42
	// console.log(x, y, sin, cos)
	ctx.moveTo(x, y + 7 + player.lightRadius / 40)
	ctx.lineTo(
		x - Math.min(width / 2, player.lightRadius * 2),
		y + 50 + player.lightRadius / 15
	)
	ctx.lineTo(
		x - Math.min(width / 2, player.lightRadius * 2),
		y - 50 - player.lightRadius / 15
	)
	ctx.lineTo(x, y - 7 - player.lightRadius / 40)
	ctx.rotate(-player.rotation)
	ctx.translate(-width / 2, -height / 2)
}

function clipLightOcean() {
	if (player.position.y < height) {
		clipOcean()
	}
	clipLight()
}
function clipOcean() {
	ctx.beginPath()
	ctx.moveTo(0, height / 2 - player.position.y + Math.cos(player.position.x))
	for (let i = 1; i < width; i++) {
		ctx.lineTo(
			i,
			height / 2 -
				player.position.y +
				Math.cos((player.position.x + i) / 10) * 5
		)
	}
	ctx.lineTo(width, height)
	ctx.lineTo(0, height)
	ctx.lineTo(0, height / 2 - player.position.y + Math.cos(player.position.x))
	ctx.closePath()
	ctx.clip()
}

function drawRadar() {
	ctx.strokeStyle = "rgba(40,225,40,1)"
	ctx.fillStyle = "rgba(40,225,40,1)"
	ctx.lineWidth = 2
	ctx.font = "10px Arial black"
	ctx.textBaseline = "middle"

	let x = width / 2
	let y = 100

	ctx.beginPath()
	ctx.arc(x, y, 4, 0, Math.PI * 2, 0)
	ctx.fill()
	ctx.closePath()
	let pxPerMeter = radarPxSize / (getRadarSize() * radarRingDistance)
	for (let i = 1; i <= getRadarSize(); i++) {
		ctx.beginPath()
		ctx.arc(x, y, i * pxPerMeter * radarRingDistance, 0, Math.PI * 2, 0)
		ctx.stroke()
		ctx.closePath()
		// ctx.fillText(i * 100, x - i * sizePerKm + 2, y)
	}

	spawnedMobs
		.filter(mob => mob.radarPoint)
		.forEach(mob => {
			mob.radarPulse = Math.max(0, mob.radarPulse - 1)
			ctx.beginPath()
			let relX = mob.radarPoint.x - player.position.x
			let relY = mob.radarPoint.y - player.position.y
			ctx.arc(
				x + relX * pxPerMeter,
				y + relY * pxPerMeter,
				3 + (3 * mob.radarPulse - 50) / 50,
				0,
				Math.PI * 2,
				0
			)
			ctx.fill()
			ctx.closePath()
		})
	ctx.beginPath()
	ctx.moveTo(x, y)
	ctx.lineTo(
		x + Math.cos(radarTicker) * radarPxSize,
		y + Math.sin(radarTicker) * radarPxSize
	)
	ctx.stroke()
	ctx.closePath()

	// ctx.beginPath()
	// ctx.arc(x, y, 40, 0, Math.PI * 2, 0)
	// ctx.stroke()
	// ctx.closePath()

	// ctx.beginPath()
	// ctx.arc(x, y, 15, 0, Math.PI * 2, 0)
	// ctx.stroke()
	// ctx.closePath()

	// ctx.beginPath()
	// ctx.arc(x, y, 4, 0, Math.PI * 2, 0)
	// ctx.fill()
	// ctx.closePath()
}
function drawSky() {
	if (player.position.y < height) {
		ctx.fillStyle = "rgba(150,170,220,1)"
		ctx.beginPath()
		ctx.moveTo(0, height / 2 - player.position.y + Math.cos(player.position.x))
		for (let i = 1; i < width; i++) {
			ctx.lineTo(
				i,
				height / 2 -
					player.position.y +
					Math.cos((player.position.x + i) / 10) * 5
			)
		}
		ctx.lineTo(width, 0)
		ctx.lineTo(0, 0)
		ctx.lineTo(0, height / 2 - player.position.y + Math.cos(player.position.x))
		ctx.fill()
		ctx.closePath()
	}
}
function getJitter() {
	return upClicked || downClicked
		? {
				x: (Math.random() - Math.random()) * 3,
				y: (Math.random() - Math.random()) * 3
		  }
		: { x: 0, y: 0 }
}
function drawPlayer() {
	ctx.save()
	let jitter = getJitter()
	ctx.translate(width / 2 + jitter.x, height / 2 + jitter.y)
	ctx.rotate(player.rotation)
	ctx.drawImage(
		imgs["Submarine"].img,
		-imgs["Submarine"].width / 2,
		-imgs["Submarine"].height / 2,
		imgs["Submarine"].width,
		imgs["Submarine"].height
	)
	ctx.restore()

	// ctx.fillText(
	// 	player.position.x + "," + player.position.y + "/  " + player.rotation,
	// 	20,
	// 	20
	// )
}

function drawMobs() {
	if (spawnedMobs) {
		spawnedMobs.forEach(mob => {
			ctx.save()
			ctx.translate(
				width / 2 + mob.position.x - player.position.x,
				height / 2 + mob.position.y - player.position.y
			)
			let img = mob.mirrored ? imgs[mob.img + "R"] : imgs[mob.img]

			ctx.rotate(mob.rotation)
			ctx.drawImage(img.img, -img.width / 2, -img.height / 2)
			ctx.restore()
		})
	}
}
function drawOcean() {
	ctx.strokeStyle = "rgba(255,255,255,0.4)"
	ctx.lineWidth = "3"
	ctx.beginPath()
	ctx.moveTo(0, height / 2 - player.position.y + Math.cos(player.position.x))
	for (let i = 1; i < width; i++) {
		ctx.lineTo(
			i,
			height / 2 -
				player.position.y +
				Math.cos((player.position.x + i) / 10) * 5
		)
	}
	ctx.stroke()
	ctx.closePath()
}
function drawBorders() {
	ctx.strokeStyle = "brown"
	ctx.fillStyle = "brown"
	ctx.lineWidth = 5
	//left
	ctx.fillRect(0, 0, -2000 + width / 2 - player.position.x, height)
	ctx.fillRect(2000 + width / 2 - player.position.x, 0, width, height)
	ctx.fillRect(0, 11000 * 25 + height / 2 - player.position.y, width, height)
	//bottom
	ctx.beginPath()
	ctx.moveTo(-2000 + width / 2 - player.position.x, 0)
	ctx.lineTo(-2000 + width / 2 - player.position.x, height)
	ctx.stroke()
	ctx.closePath()
}

const imgList = [
	{ name: "Submarine", width: 128, height: 101 },
	{ name: "smallFish", width: 13, height: 5 },
	{ name: "mediumFish", width: 16, height: 8 },
	{ name: "largeFish", width: 30, height: 21 },
	{ name: "jellyfish", width: 19, height: 27 },
	{ name: "turtle", width: 47, height: 26 },
	{ name: "anglerFish", width: 44, height: 24 },
	{ name: "babyShark", width: 72, height: 37 },
	{ name: "dolphin", width: 89, height: 41 },
	{ name: "noseFish", width: 129, height: 53 },
	{ name: "shark", width: 166, height: 86 },
	{ name: "smallFishR", width: 13, height: 5 },
	{ name: "mediumFishR", width: 16, height: 8 },
	{ name: "largeFishR", width: 30, height: 21 },
	{ name: "jellyfishR", width: 19, height: 27 },
	{ name: "turtleR", width: 47, height: 26 },
	{ name: "anglerFishR", width: 44, height: 24 },
	{ name: "babySharkR", width: 72, height: 37 },
	{ name: "dolphinR", width: 89, height: 41 },
	{ name: "noseFishR", width: 129, height: 53 },
	{ name: "sharkR", width: 166, height: 86 },
	{ name: "can", width: 12, height: 22 },
	{ name: "shoe", width: 25, height: 16 },
	{ name: "sixpack", width: 31, height: 20 },
	{ name: "seaweed", width: 37, height: 37 },
	{ name: "tire", width: 38, height: 38 },
	{ name: "barrel", width: 32, height: 45 },
	{ name: "plasticBag", width: 40, height: 42 },
	{ name: "newspaper", width: 507, height: 306 }
]
var imgs = {}
var imgsLoadedCounter = 0
function loadImages() {
	imgList.forEach(img => {
		let newImgObj = {}
		newImgObj.width = img.width
		newImgObj.height = img.height
		newImgObj.img = new Image()
		newImgObj.img.src = img.name + ".png"
		if (img.name == "Submarine") {
			player.width = img.width
			player.height = img.height
		}
		newImgObj.img.onload = () => {
			imgsLoadedCounter++
			checkAllImgsLoaded()
		}
		imgs[img.name] = newImgObj
	})
}
function checkAllImgsLoaded() {
	if (imgsLoadedCounter == imgList.length) {
		setupCanvases()
		start()
	}
}
