'use strict'

const canvases = document.getElementsByClassName('canvases__canvas')
const mainCanvas = document.getElementById('main-canvas')
const mainCtx = mainCanvas.getContext('2d')

const ui = {
  progress: document.getElementById('progress'),
  textStart: document.getElementById('text-start'),
  message: document.getElementById('message')
}

const messages = [
  'Привет, <span class="pink">Божена</span>',
  'Как спалось?',
  '<span class="blue">Мне</span> тоже охуенно)0)',
  '<span class="blue">Я</span> тут прикол сделал'
]

const MAX_RANGE = 20
const MAX_PROGRESS = 2500

let running = false
let messageCount = 0
let previousX = 0
let previousY = 0
let previousZ = 0

let progress = 0
let block = false

Array.from(canvases).forEach(function (canvas) {
  function resizeHandler() {
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio)
    canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio)
  }

  window.addEventListener('resize', resizeHandler)

  resizeHandler()
})

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  add(vector) {
    this.x += vector.x
    this.y += vector.y

    return this
  }

  scale(a) {
    this.x *= a
    this.y *= a

    return this
  }

  clone() {
    return new Vector(this.x, this.y)
  }
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}


function vibrate(value) {
  if ('vibrate' in window.navigator) {
    return window.navigator.vibrate(value)
  }
}

class Particle {
  constructor(x, y, dirX, dirY, radius = 20, maxSpread = 50) {
    this.position = new Vector(x, y)
    this.direction = new Vector(dirX, dirY)
    this.speed = 0.1
    this.maxSpread = maxSpread
    this.acceleration = 0.25
    this.radius = radius
    this.alpha = 1
    this.end = false
  }

  move() {
    if (this.end) {
      return
    }

    this.speed += this.acceleration
    this.position.add(this.direction.clone().scale(this.speed))
    this.radius = Math.max(this.radius - (this.radius / this.maxSpread), 0)
    // this.alpha = Math.max(this.alpha - (1 / this.maxSpread), 0)

    if (this.radius === 0 || this.alpha === 0) {
      this.end = true
    }
  }

  draw() {
    if (this.end) {
      return
    }

    mainCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`
    mainCtx.beginPath()
    mainCtx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    mainCtx.fill()
  }
}

class Boom {
  particles = []

  constructor(x, y, numParticles = 10, startRadius = 30, endRadius = 5) {
    for (let i = 0; i < numParticles; i++) {
      const particle = new Particle(x, y, getRandomFloat(-1, 1), getRandomFloat(-1, 1), getRandomInt(startRadius, endRadius))

      this.particles.push(particle)
    }
  }

  move() {
    this.particles.forEach((particle) => particle.move())
  }

  draw() {
    this.particles.forEach((particle) => particle.draw())
  }
}

class Dick {
  constructor(x, y) {
    this.position = new Vector(x, y)
  }

  draw() {
    mainCtx.fillStyle = '#ffb4a2'
    mainCtx.fillRect(this.position.x - 100, this.position.y - 500, 200, 500)

    mainCtx.fillStyle = '#ef233c'
    mainCtx.beginPath()
    mainCtx.arc(this.position.x, this.position.y - 500, 100, 0, Math.PI, true)
    mainCtx.fill()

    mainCtx.fillStyle = '#ef233c'
    mainCtx.fillRect(this.position.x - 100, this.position.y - 500, 200, 50)

    mainCtx.fillStyle = '#d90429'
    mainCtx.fillRect(this.position.x - 5, this.position.y - 600, 10, 50)

  }
}

const dick = new Dick(mainCanvas.width / 2, mainCanvas.height)
const booms = []

function makeBooms() {
  for (let i = 0; i < 20; i++) {
    booms.push(new Boom(mainCanvas.width / 2 + getRandomInt(-150, 150), mainCanvas.height / 2 + getRandomInt(-150, 150), 10, 200))
  }
}


function deviceMotionHandler(event) {
  if (!running) {
    return
  }

  const differenceX = event.acceleration.x - previousX
  const differenceY = event.acceleration.y - previousY
  const differenceZ = event.acceleration.z - previousZ

  const range = Math.abs(differenceX + differenceY + differenceZ)

  if (range > MAX_RANGE && !block) {
    if (progress < MAX_PROGRESS) {
      progress = Math.min(progress + range, MAX_PROGRESS)
      ui.progress.style.width = progress / MAX_PROGRESS * 100 + '%'

      vibrate(150)
    } else {
      block = true
      progress = 0
      ui.progress.style.width = progress / MAX_PROGRESS * 100 + '%'

      makeBooms()
      vibrate(2500)

      setTimeout(() => {
        block = false
        booms = []
      }, 2500)
    }
  }

  previousX = event.acceleration.x
  previousY = event.acceleration.y
  previousZ = event.acceleration.z
}

if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', deviceMotionHandler)
}

function tick() {
  if (!running) {
    return
  }

  mainCtx.fillStyle = '#8f2d56'
  mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height)

  dick.draw()

  booms.forEach((boom) => {
    boom.move()
    boom.draw()
  })

  requestAnimationFrame(tick)
}

function setMessage() {
  ui.message.innerHTML = messages[messageCount]

  if (messageCount < messages.length) {
    setTimeout(setMessage, 2800)

    messageCount++
  } else {
    ui.message.style.display = 'none'
    ui.textStart.style.display = 'block'

    window.addEventListener('click', function () {
      running = true
      ui.textStart.style.display = 'none'

      requestAnimationFrame(tick)
    })
  }
}

setMessage()
