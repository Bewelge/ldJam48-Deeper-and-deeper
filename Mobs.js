class Mob {
	constructor(mob, key) {
		this.key = key
		this.img = mob.img
		this.width = imgs[mob.img].width
		this.height = imgs[mob.img].height

		this.type = mob.type
		this.dead = mob.dead
		this.value = mob.value
		this.damage = mob.damage
		this.health = mob.health
		this.spawn = mob.spawn
		this.updatePosition = mob.updatePosition

		let posAndMot = mob.initPosAndMotion()
		this.position = posAndMot.position
		this.motion = posAndMot.motion
		this.rotation = posAndMot.rotation
		this.rotationSpeed = posAndMot.rotationSpeed
		this.mirrored = posAndMot.mirrored
	}
	move() {
		this.updatePosition(this)
		this.disToPlayer = distPoints(this.position, player.position)
		this.angToPlayer = anglePoints(player.position, this.position)
		if (Math.abs(compareAngles(this.angToPlayer, radarTicker)) < 0.1) {
			if (
				distPoints(this.position, player.position) >
				radarRingDistance * getRadarSize()
			) {
				this.radarPoint = null
				this.radarPulse = 0
			} else {
				this.radarPoint = {
					x: this.position.x,
					y: this.position.y
				}
				this.radarPulse = 100
			}
		}
		if (
			this.disToPlayer >
			Math.max(
				width + 100,
				height + 100,
				getRadarSize() * radarRingDistance + 200
			)
		) {
			this.dead = true
		}
		if (
			this.position.x < -2000 ||
			this.position.x > 2000 ||
			this.position.y < 0 ||
			this.position.y > 11000 * 25
		) {
			this.dead = true
		}
	}
}

var spawnedMobs = []

var maxMobAmount = 5
function spawnMobs() {
	if (spawnedMobs.length < maxMobAmount) {
		let roll = Math.random()
		if (roll < (maxMobAmount - spawnedMobs.length) / 5) {
			let mobToSpawn = chooseMob(player.position.y)
			if (mobToSpawn) {
				spawnMob(mobToSpawn)
			}
		}
	}
}
function updateMobs() {
	spawnedMobs.forEach(mob => mob.move())
	spawnedMobs = spawnedMobs.filter(mob => !mob.dead)
}
function spawnMob(mobKey) {
	console.log("spawning " + mobKey)
	spawnedMobs.push(new Mob(mobs[mobKey], mobKey))
}
function chooseMob(elevation) {
	let mobsArr = Object.keys(mobs)
		.map(key => {
			return {
				key: key,
				depths: mobs[key].depths.filter(
					depth => depth.min < elevation && depth.max > elevation
				)
			}
		})
		.filter(mobAndDepth => mobAndDepth.depths.length > 0)

	let totalRoll = mobsArr
		.map(mobAndDepths => mobAndDepths.depths[0].roll)
		.reduce((prev, current) => prev + current, 0)

	let roll = Math.random() * totalRoll
	let countingRoll = 0
	for (let i = 0; i < mobsArr.length; i++) {
		let mobAndDepth = mobsArr[i]
		if (
			roll > countingRoll &&
			roll <= countingRoll + mobAndDepth.depths[0].roll
		) {
			return mobAndDepth.key
		}
		countingRoll += mobAndDepth.depths[0].roll
	}
}

function getRandomSpawnPos(direction) {
	let below = Math.random() < 0.5
	let x = player.position.x + direction * getRadarSize() * radarRingDistance
	let y = Math.random() * height + player.position.y
	if (below) {
		x = Math.random() * width + player.position.x - width / 2
		y = player.position.y + getRadarSize() * radarRingDistance
	}
	return {
		x: x,
		y: y
	}
}
var mobs = {
	"Small Fish": {
		img: "smallFish",
		type: "fish",
		dead: false,
		value: 5,
		damage: 0,
		health: 10,
		depths: [
			{ min: height / 2, max: 500 * 25, roll: 25 },
			{ min: 500 * 25, max: 4000 * 25, roll: 15 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.4 + 0.4), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0,
				rotationSpeed: (Math.random() - Math.random()) * 0.5
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	"Medium Fish": {
		img: "mediumFish",
		type: "fish",
		dead: false,
		value: 15,
		damage: 0,
		health: 20,
		depths: [
			{ min: 250 * 25, max: 500 * 25, roll: 15 },
			{ min: 500 * 25, max: 4000 * 25, roll: 50 },
			{ min: 4000 * 25, max: 6000 * 25, roll: 25 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	"Large Fish": {
		img: "largeFish",
		type: "fish",
		dead: false,
		value: 150,
		damage: 0,
		health: 20,
		depths: [
			{ min: 500 * 25, max: 1000 * 25, roll: 10 },
			{ min: 1000 * 25, max: 4000 * 25, roll: 40 },
			{ min: 4000 * 25, max: 7000 * 25, roll: 15 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Jellyfish: {
		img: "jellyfish",
		type: "fish",
		dead: false,
		value: 500,
		damage: 0,
		health: 20,
		depths: [
			{ min: height / 2, max: 3000 * 25, roll: 3 },
			{ min: 3000 * 25, max: 6000 * 25, roll: 6 },
			{ min: 6000 * 25, max: 11000 * 25, roll: 9 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Turtle: {
		img: "turtle",
		type: "fish",
		dead: false,
		value: 2000,
		damage: 0,
		health: 20,
		depths: [
			{ min: height / 2, max: 3000 * 25, roll: 1 },
			{ min: 3000 * 25, max: 6000 * 25, roll: 2 },
			{ min: 6000 * 25, max: 11000 * 25, roll: 3 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	"Angler Fish": {
		img: "anglerFish",
		type: "fish",
		dead: false,
		value: 15000,
		damage: 0,
		health: 20,
		depths: [{ min: 8000 * 25, max: 11000 * 25, roll: 25 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	"Baby Sharks": {
		img: "babyShark",
		type: "fish",
		dead: false,
		value: 4000,
		damage: 0,
		health: 20,
		depths: [
			{ min: 3000 * 25, max: 6000 * 25, roll: 4 },
			{ min: 6000 * 25, max: 11000 * 25, roll: 15 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Dolphin: {
		img: "dolphin",
		type: "fish",
		dead: false,
		value: 7500,
		damage: 0,
		health: 20,
		depths: [
			{ min: 2500 * 25, max: 6000 * 25, roll: 10 },
			{ min: 2000 * 25, max: 11000 * 25, roll: 15 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Narwhal: {
		img: "noseFish",
		type: "fish",
		dead: false,
		value: 10000,
		damage: 0,
		health: 20,
		depths: [
			{ min: 5000 * 25, max: 8000 * 25, roll: 10 },
			{ min: 8000 * 25, max: 11000 * 25, roll: 15 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Shark: {
		img: "shark",
		type: "fish",
		dead: false,
		value: 20000,
		damage: 0,
		health: 20,
		depths: [
			{ min: 4000 * 25, max: 7000 * 25, roll: 5 },
			{ min: 7000 * 25, max: 11000 * 25, roll: 10 }
		],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0,
				mirrored: direction > 0 ? 1 : 0
			}
		},
		updatePosition: theMob => {
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Can: {
		img: "can",
		type: "trash",
		dead: false,
		value: 10,
		damage: 0,
		health: 1,
		depths: [{ min: height / 2, max: 11000 * 25, roll: 15 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: Math.max(0, direction * Math.PI)
			}
		},
		updatePosition: theMob => {
			theMob.rotation += theMob.rotationSpeed
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Shoe: {
		img: "shoe",
		type: "trash",
		dead: false,
		value: 25,
		damage: 0,
		health: 1,
		depths: [{ min: 150 * 25, max: 11000 * 25, roll: 10 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: Math.max(0, direction * Math.PI)
			}
		},
		updatePosition: theMob => {
			theMob.rotation += theMob.rotationSpeed
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Sixpack: {
		img: "sixpack",
		type: "trash",
		dead: false,
		value: 80,
		damage: 0,
		health: 1,
		depths: [{ min: 300 * 25, max: 11000 * 25, roll: 8 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: Math.max(0, direction * Math.PI)
			}
		},
		updatePosition: theMob => {
			theMob.rotation += theMob.rotationSpeed
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Seaweed: {
		img: "seaweed",
		type: "trash",
		dead: false,
		value: 10,
		damage: 0,
		health: 1,
		depths: [{ min: height / 2, max: 11000 * 25, roll: 6 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: Math.max(0, direction * Math.PI)
			}
		},
		updatePosition: theMob => {
			theMob.rotation += theMob.rotationSpeed
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Tire: {
		img: "tire",
		type: "trash",
		dead: false,
		value: 2500,
		damage: 0,
		health: 1,
		depths: [{ min: 600 * 25, max: 11000 * 25, roll: 5 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: Math.max(0, direction * Math.PI)
			}
		},
		updatePosition: theMob => {
			theMob.rotation += theMob.rotationSpeed
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	},
	Barrel: {
		img: "barrel",
		type: "trash",
		dead: false,
		value: 5000,
		damage: 0,
		health: 1,
		depths: [{ min: 1500 * 25, max: 11000 * 25, roll: 3 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: {
					x: -direction * (Math.random() * 0.9 + 0.1),
					y: Math.random() - Math.random()
				},
				rotation: Math.max(0, direction * Math.PI)
			}
		},
		updatePosition: theMob => {
			theMob.rotation += theMob.rotationSpeed
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
			theMob.rot
		}
	},
	"Plastic Bag": {
		img: "plasticBag",
		type: "trash",
		dead: false,
		value: 1000000,
		damage: 0,
		health: 1,
		depths: [{ min: 10950 * 25, max: 11000 * 25, roll: 1 }],
		initPosAndMotion: () => {
			let direction = Math.sign(Math.random() - Math.random())
			return {
				position: getRandomSpawnPos(direction),
				motion: { x: -direction * (Math.random() * 0.8 + 0.6), y: 0 },
				rotation: 0
			}
		},
		updatePosition: theMob => {
			theMob.rotation += theMob.rotationSpeed
			theMob.position.x += theMob.motion.x
			theMob.position.y += theMob.motion.y
		}
	}
}
