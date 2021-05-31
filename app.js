const CANVAS = {
  WIDTH: 1000,
  HEIGHT: 600,
}

const DINOSAUR = {
  WIDTH: 25,
  HEIGHT: 40,
  MAX_JUMP_HEIGHT: 100,
}

const GAME = {
  DEFAULT_SPEED: 5,
  SPEED_MULTIPLIER: 0.1,
  SPEED_MULTIPLIER_RATE: 100,
  OBSTACLE_SPAWN_RATE: 100,
  FLYING_OBSTACLE_SPAWN_RATE: 130,
  MARGIN: 10,
}

class Dinosaur {
  constructor(ctx, x, y, color) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.color = color
    this.width = DINOSAUR.WIDTH
    this.height = DINOSAUR.HEIGHT

    this.gravity = 0.5
    this.gravitySpeed = 0
    this.jumpPower = 0
    this.jumpHeight = 0
  }

  render() {
    const ctx = this.ctx

    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Obstacle {
  constructor(ctx, x, y, width, height, color) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.color = color
    this.width = width
    this.height = height
  }

  render() {
    const ctx = this.ctx

    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

const game = {
  run() {
    this.canvas = document.getElementById('canvas')
    this.canvas.width = CANVAS.WIDTH
    this.canvas.height = CANVAS.HEIGHT

    this.ctx = this.canvas.getContext('2d')

    this.frameNo = 0
    this.freeze = false
    this.land = this.canvas.height - DINOSAUR.HEIGHT - GAME.MARGIN
    this.speed = GAME.DEFAULT_SPEED

    this.dinosaur = new Dinosaur(
      this.ctx,
      this.canvas.width / 4,
      this.land,
      'black'
    )

    this.obstacles = []
    this.keys = []

    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true

      if (this.freeze && this.keys[' ']) {
        this.restart()
      }
    })

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false
    })

    requestAnimationFrame(() => {
      this.render()
    })
  },

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  },

  landed() {
    this.dinosaur.gravitySpeed = 0
    this.dinosaur.jumpHeight = 0
  },

  checkMoves() {
    if (this.keys['ArrowUp'] || this.keys[' ']) {
      if (this.dinosaur.gravitySpeed === 0) {
        if (this.dinosaur.jumpHeight + 10 <= DINOSAUR.MAX_JUMP_HEIGHT) {
          this.dinosaur.jumpPower = 7
          this.dinosaur.jumpHeight += 10
        }
      }
    }

    if (this.dinosaur.jumpPower > 0) {
      // Kalau masih ada jump power
      this.dinosaur.y -= this.dinosaur.jumpPower
      this.dinosaur.jumpPower -= this.dinosaur.gravity

      // Reset gravity speed agar setiap lompatan ada gravitasinya sendiri
      this.dinosaur.gravitySpeed = 0
    } else if (this.dinosaur.y <= this.land) {
      // Kalau lompatan sudah selesai
      this.dinosaur.gravitySpeed += this.dinosaur.gravity

      const nextPos = this.dinosaur.y + this.dinosaur.gravitySpeed

      if (nextPos > this.land) {
        this.dinosaur.y = this.land

        this.landed()
      } else {
        this.dinosaur.y += this.dinosaur.gravitySpeed
      }
    } else {
      this.landed()
    }
  },

  spawnObstacle() {
    if (this.frameNo % GAME.OBSTACLE_SPAWN_RATE === 0) {
      const obstacleHeight = 40

      this.obstacles.push(
        new Obstacle(
          this.ctx,
          CANVAS.WIDTH - GAME.MARGIN,
          CANVAS.HEIGHT - GAME.MARGIN - obstacleHeight,
          25,
          obstacleHeight,
          'red'
        )
      )
    }
    if (this.frameNo % GAME.FLYING_OBSTACLE_SPAWN_RATE === 0) {
      const obstacleHeight = 20

      this.obstacles.push(
        new Obstacle(
          this.ctx,
          CANVAS.WIDTH - GAME.MARGIN,
          CANVAS.HEIGHT - GAME.MARGIN - obstacleHeight * 4,
          50,
          obstacleHeight,
          'red'
        )
      )
    }
  },

  moveObstacles() {
    this.obstacles.forEach((obstacle) => {
      obstacle.x -= this.speed

      obstacle.render()
    })
  },

  isCrashed(obstacle) {
    const dinoLeft = this.dinosaur.x
    const dinoRight = this.dinosaur.x + this.dinosaur.width
    const dinoTop = this.dinosaur.y
    const dinoBottom = this.dinosaur.y + this.dinosaur.height
    const obsLeft = obstacle.x
    const obsRight = obstacle.x + obstacle.width
    const obsTop = obstacle.y
    const obsBottom = obstacle.y + obstacle.height

    let crash = true

    if (
      dinoLeft > obsRight ||
      dinoRight < obsLeft ||
      dinoTop > obsBottom ||
      dinoBottom < obsTop
    ) {
      crash = false
    }

    return crash
  },

  checkCollision() {
    for (let index = 0; index < this.obstacles.length; index++) {
      const obstacle = this.obstacles[index]

      if (this.isCrashed(obstacle)) {
        return true
      }
    }
  },

  stop(message = '') {
    this.freeze = 1

    if (message) {
      const ctx = this.ctx

      ctx.font = 'bold 50px arial'
      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'
      ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2)

      ctx.font = '20px arial'
      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'
      ctx.fillText(
        'Tekan spasi untuk bermain lagi',
        this.canvas.width / 2,
        this.canvas.height / 2 + 30
      )
    }
  },

  restart() {
    this.freeze = 0
    this.clear()
    // this.frameNo = 1
    this.obstacles = []
    this.speed = GAME.DEFAULT_SPEED

    requestAnimationFrame(() => {
      this.render()
    })
  },

  render() {
    if (this.freeze) return

    this.clear()

    this.frameNo += 1

    if (this.frameNo % GAME.SPEED_MULTIPLIER_RATE === 0) {
      this.speed += GAME.SPEED_MULTIPLIER
    }

    this.dinosaur.render()

    this.checkMoves()

    this.spawnObstacle()

    this.moveObstacles()

    if (this.checkCollision()) {
      this.stop('GAME OVER')
    }

    requestAnimationFrame(() => {
      this.render()
    })
  },
}

game.run()
