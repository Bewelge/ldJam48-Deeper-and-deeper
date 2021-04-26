var money = 0
function openMain() {
	let mainDiv = DomHelper.createDivWithClass("wrapper")
	let title = DomHelper.createDivWithClass("title")
	title.style.opacity = 0
	title.innerHTML = "The Hunt for the Plastic Bag"
	let subtitle = DomHelper.createDivWithClass("subTitle")
	subtitle.style.opacity = 0
	subtitle.innerHTML = "Click to Start"
	let bottomTitle = DomHelper.createDivWithClass("bottomTitle")
	bottomTitle.style.opacity = 0
	bottomTitle.innerHTML =
		'Ludum Dare 48 "Deeper and deeper" -  A game by Bewelge'
	mainDiv.appendChild(title)
	mainDiv.appendChild(subtitle)
	mainDiv.appendChild(bottomTitle)
	document.body.appendChild(mainDiv)
}
function openEnd() {
	let mainDiv = DomHelper.createDivWithClass("wrapper")
	let title = DomHelper.createDivWithClass("title")
	title.style.opacity = 0
	title.innerHTML = "Congrats! You found the plastic bag"

	let bottomTitle = DomHelper.createDivWithClass("bottomTitle")
	bottomTitle.style.opacity = 0
	bottomTitle.innerHTML = "Thank you for playing"
	mainDiv.appendChild(title)
	mainDiv.appendChild(bottomTitle)
	document.body.appendChild(mainDiv)
	title.style.opacity = 1
	bottomTitle.style.opacity = 1
}
function openScore() {
	let mainDiv = DomHelper.createDivWithClass("wrapper")
	let title = DomHelper.createDivWithClass("title")
	title.innerHTML = "Score: "
	mainDiv.appendChild(title)
	let scoreBoard = DomHelper.createDivWithClass("scoreboard")
	scoreBoard.appendChild(getScoreContent())
	mainDiv.appendChild(scoreBoard)
	let againBtn = DomHelper.createButton("againBtn", () => {
		restart()
	})
	againBtn.innerHTML = "Try again"
	let shopBtn = DomHelper.createButton("shopBtn", () => openShop())
	shopBtn.innerHTML = "Open Shop"
	let btnGrp = DomHelper.createButtonGroup(false)

	btnGrp.appendChild(againBtn)
	btnGrp.appendChild(shopBtn)
	mainDiv.appendChild(btnGrp)
	document.body.appendChild(mainDiv)
}

function getScoreContent() {
	let wrap = DomHelper.createDiv()
	let totalAmount = 0
	let lowst = DomHelper.createDivWithClass("scoreLine")
	lowst.innerHTML = "Lowest Point: "
	lowst.appendChild(
		DomHelper.createElementWithClass(
			"scoreLineVal",
			"span",
			{},
			{ innerHTML: "-" + Math.floor(player.lowestElev / 25) + "m" }
		)
	)
	totalAmount += Math.floor(player.lowestElev / 25)
	wrap.appendChild(lowst)
	let lowstMoney = DomHelper.createDivWithClass("indentedLine")

	lowstMoney.innerHTML = "-"
	lowstMoney.appendChild(
		DomHelper.createElementWithClass(
			"scoreLineVal",
			"span",
			{},
			{
				innerHTML: "$" + Math.floor(player.lowestElev / 25)
			}
		)
	)
	wrap.appendChild(lowstMoney)

	let collected = DomHelper.createDivWithClass("scoreLine")
	collected.innerHTML = "Collected: "
	collected.appendChild(
		DomHelper.createElementWithClass("scoreLineVal", "span")
	)
	wrap.appendChild(collected)
	Object.keys(mobs)
		.filter(key => arrayContains(player.bag, key))
		.sort((a, b) => a.value - b.value)
		.forEach(key => {
			let line = DomHelper.createDivWithClass("indentedLine")
			let itemAmount = player.bag.filter(item => item == key).length
			line.innerHTML = key + " (x" + itemAmount + "): "
			line.appendChild(
				DomHelper.createElementWithClass(
					"scoreLineVal",
					"span",
					{},
					{
						innerHTML: "$" + itemAmount * mobs[key].value
					}
				)
			)
			// let line2 = DomHelper.createDivWithClass("scoreLine")
			// line2.innerHTML = "-"
			// line2.appendChild(
			// 	DomHelper.createElementWithClass(
			// 		"scoreLineVal",
			// 		"span",
			// 		{},
			// 		{
			// 			innerHTML: "$" + itemAmount * mobs[key].value
			// 		}
			// 	)
			// )
			totalAmount += itemAmount * mobs[key].value
			wrap.appendChild(line)
			// wrap.appendChild(line2)
		})

	money += totalAmount
	let total = DomHelper.createDivWithClass("largeLine")
	total.innerHTML = "Total: "
	total.appendChild(
		DomHelper.createElementWithClass(
			"scoreLineVal",
			"span",
			{},
			{ innerHTML: "$" + totalAmount }
		)
	)
	wrap.appendChild(total)
	return wrap
}
function openShop() {
	closeAllMenus()
	let mainDiv = DomHelper.createDivWithClass("wrapper")
	let inner = DomHelper.createDivWithClass("scoreboard")
	let title = DomHelper.createDivWithClass("title")
	title.innerHTML = "Money: $" + roundToDecimals(money, 0)
	mainDiv.appendChild(title)
	inner.appendChild(getFuelUpgrade())
	inner.appendChild(getSpeedUpgrade())
	inner.appendChild(getManeuvrabilityUpgrade())
	inner.appendChild(getLightUpgrade())
	inner.appendChild(getRadarUpgrade())
	mainDiv.appendChild(inner)
	let againBtn = DomHelper.createButton("againBtn", () => {
		restart()
	})
	againBtn.innerHTML = "Try again"

	let btnGrp = DomHelper.createButtonGroup(false)
	btnGrp.appendChild(againBtn)
	mainDiv.appendChild(btnGrp)
	document.body.appendChild(mainDiv)
	updateShop()
}
function closeAllMenus() {
	document
		.querySelectorAll(".wrapper")
		.forEach(el => el.parentNode.removeChild(el))
}

function sellBag() {
	player.bag.forEach(item => {})
}

var fuelDiv = null
function getUpgradeRow(upgradeName) {
	let main = DomHelper.createDivWithClass("upgradeWrap")
	let buyButton = DomHelper.createButton(upgradeName + "Btn", () => {
		if (canBuyUpgrade(upgradeName)) {
			buyUpgrade(upgradeName)
		}
	})
	buyButton.disabled = !canBuyUpgrade(upgradeName)
	DomHelper.addClassToElement("shopBtn", buyButton)
	buyButton.innerHTML = upgradeName

	let price = DomHelper.createElementWithClass("price", "span")
	price.innerHTML =
		upgrades[upgradeName].level < upgrades[upgradeName].maxLevel
			? "$" + upgrades[upgradeName].price(upgrades[upgradeName].level)
			: "-"
	buyButton.appendChild(price)

	let progrBar = DomHelper.createDivWithClass("upgradeProgressBar")
	progrBar.innerHTML =
		upgrades[upgradeName].level + "/" + upgrades[upgradeName].maxLevel
	main.appendChild(buyButton)
	main.appendChild(progrBar)
	return main
}
function getFuelUpgrade() {
	if (!fuelDiv) {
		fuelDiv = getUpgradeRow("Fuel")
	}
	return fuelDiv
}
var speedDiv = null
function getSpeedUpgrade() {
	if (!speedDiv) {
		speedDiv = getUpgradeRow("Speed")
	}
	return speedDiv
}
var maneuvrabilityDiv = null
function getManeuvrabilityUpgrade() {
	if (!maneuvrabilityDiv) {
		maneuvrabilityDiv = getUpgradeRow("Maneuvrability")
	}
	return maneuvrabilityDiv
}
var lightDiv = null
function getLightUpgrade() {
	if (!lightDiv) {
		lightDiv = getUpgradeRow("Light")
	}
	return lightDiv
}
var radarDiv = null
function getRadarUpgrade() {
	if (!radarDiv) {
		radarDiv = getUpgradeRow("Radar")
	}
	return radarDiv
}
function canBuyUpgrade(upgrade) {
	return (
		upgrades[upgrade].price(upgrades[upgrade].level) <= money &&
		upgrades[upgrade].level < upgrades[upgrade].maxLevel
	)
}
function buyUpgrade(upgrade) {
	money -= upgrades[upgrade].price(upgrades[upgrade].level)
	document.querySelector(".title").innerHTML =
		"Money: $" + roundToDecimals(money, 0)
	upgrades[upgrade].level++
	// let div = window["get" + upgrade + "Upgrade"]()
	// div.querySelector(".upgradeProgressBar").innerHTML =
	// 	upgrades[upgrade].level + "/" + upgrades[upgrade].maxLevel

	// div.querySelector(".shopBtn span").innerHTML =
	// 	"$" + upgrades[upgrade].price(upgrades[upgrade].level)
	updateShop()
}
function updateShop() {
	for (let key in upgrades) {
		let upDiv = window["get" + key + "Upgrade"]()
		upDiv.querySelector(".upgradeProgressBar").innerHTML =
			upgrades[key].level + "/" + upgrades[key].maxLevel

		upDiv.querySelector(".shopBtn span").innerHTML =
			upgrades[key].level < upgrades[key].maxLevel
				? "$" + upgrades[key].price(upgrades[key].level)
				: "-"
		upDiv.querySelector(".shopBtn").disabled = !canBuyUpgrade(key)
	}
}
var upgrades = {
	Fuel: {
		level: 0,
		maxLevel: 10,
		price: level => {
			return [
				10,
				100,
				500,
				2000,
				10000,
				25000,
				100000,
				250000,
				1000000,
				2500000,
				10000000
			][level]
		},
		buy: () => {
			upgrades.Fuel.level++
		}
	},
	Speed: {
		level: 0,
		maxLevel: 5,
		price: level => {
			return [10, 500, 10000, 100000, 60000, 1500000][level]
		},
		buy: () => {
			upgrades.Speed.level++
		}
	},
	Maneuvrability: {
		level: 0,
		maxLevel: 4,
		price: level => {
			return [30, 200, 600, 1000][level]
		},
		buy: () => {
			upgrades.Maneuvrability.level++
		}
	},
	Light: {
		level: 0,
		maxLevel: 7,
		price: level => {
			return [15, 150, 1500, 15000, 150000, 1000000, 1500000][level]
		},
		buy: () => {
			upgrades.Light.level++
		}
	},
	Radar: {
		level: 0,
		maxLevel: 5,
		price: level => {
			return [50, 1000, 5000, 15000, 45000, 200000][level]
		},
		buy: () => {
			upgrades.Light.level++
		}
	}
}

function getMaxFuel() {
	return 200 * Math.pow(1.5, upgrades.Fuel.level)
}
function getPlayerSpeed() {
	return Math.pow(1.4, upgrades.Speed.level)
}

function getPlayerLight() {
	return 120 * Math.pow(1.8, upgrades.Light.level)
}
function getPlayerManeuvrability() {
	return 0.004 + 0.001 * Math.pow(2, upgrades.Maneuvrability.level)
}
function getRadarSize() {
	return 2 + upgrades.Radar.level
}
