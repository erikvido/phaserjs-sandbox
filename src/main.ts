import './style.css'
import Phaser, { GameObjects, Physics } from 'phaser'

const sizes = {
  width: 500,
  height: 500,
}

const speedDown = 300

const gameStartDiv = document.querySelector('#gameStartDiv')! as HTMLDivElement
const gameStartBtn = document.querySelector('#gameStartBtn')! as HTMLButtonElement
const gameEndDiv = document.querySelector('#gameEndDiv')! as HTMLDivElement
const gameWinLoseSpan = document.querySelector('#gameWinLoseSpan')!
const gameEndScoreSpan = document.querySelector('#gameEndScoreSpan')!

class GameScene extends Phaser.Scene{
  player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  target!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  cursor: Phaser.Types.Input.Keyboard.CursorKeys | undefined
  textScore!: GameObjects.Text

  speedPlayer:number
  points: number=0
  textTime!: GameObjects.Text
  timeEvent!: Phaser.Time.TimerEvent
  remainingTime: number=0
  coinMusic!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound
  bgMusic!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound
  emitter!: GameObjects.Particles.ParticleEmitter

  constructor() {
    super("scene-game")
    this.speedPlayer = speedDown + 50
  }

  preload() {
    this.load.image('bg', '/assets/bg.png')
    this.load.image('basket', '/assets/basket.png')
    this.load.image('apple', '/assets/apple.png')
    this.load.audio('coin', '/assets/coin.mp3')
    this.load.audio('bgMusic', '/assets/bgMusic.mp3')
  }

  create(){
    this.scene.pause('scene-game')

    this.coinMusic = this.sound.add('coin')
    this.bgMusic = this.sound.add('bgMusic')
    // this.bgMusic.play()
    // this.bgMusic.stop()

    this.add.image(0,0,"bg").setOrigin(0,0)
    this.player = this.physics.add.image(0, sizes.height - 100, "basket").setOrigin(0,0)
    this.player.setImmovable(true)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)
    this.player
      .setSize(
        this.player.width-this.player.width/4,
        this.player.height/6)
      .setOffset(
        this.player.width/10,
        this.player.height - this.player.height/2.3
      )

    this.target = this.physics.add.image(0,0,"apple").setOrigin(0,0)
      .setMaxVelocity(0, speedDown)

    this.physics.add.overlap(this.target, this.player, this.targetHit,undefined,this)

    this.cursor =  this.input.keyboard?.createCursorKeys()

    this.textScore = this.add.text(sizes.width - 120, 10, "Score:0", {
      font: "25px Arial",
      color: "#000000"
    })

    this.textTime =  this.add.text(10, 10, "Remaining Time: 00", {
      font: "25px Arial",
      color: '#000000'
    })

    this.timeEvent = this.time.delayedCall(30000, this.gameOver, [], this)

    this.emitter = this.add.particles(0, 0, "money", {
      speed: 100,
      gravityY: speedDown - 200,
      scale: 0.1,
      duration: 100,
      emitting: false
    })
    this.emitter.startFollow(this.player, this.player.width / 2, this.player.height /2, true)
  }

  update(time: number, delta: number): void {
    this.remainingTime = this.timeEvent.getRemainingSeconds()
    this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime)}`)

    if (this.target.y >= sizes.height) {
      this.target.setY(0)
      this.target.setX(this.getRandomX())
    }

    if (this.cursor) {
      const {left, right} = this.cursor;

      if (left.isDown) {
        this.player.setVelocityX(-this.speedPlayer)
      } else if (right.isDown) {
        this.player.setVelocityX(this.speedPlayer)
      } else {
        this.player.setVelocityX(0)
      }
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * (sizes.width - 20) )
  }

  targetHit() {
    this.coinMusic.play()
    this.emitter.start()
    this.target.setY(0)
    this.target.setX(this.getRandomX())
    this.points++
    this.textScore.setText(`Score:${this.points}`)
  }

  gameOver() {
    console.log("Time's up!")
    this.sys.game.destroy(true)
    if (this.points >= 10) {
      gameEndScoreSpan.textContent = this.points.toString()
      gameWinLoseSpan.textContent = 'Win! 🤗'
    } else {
      gameEndScoreSpan.textContent = this.points.toString()
      gameWinLoseSpan.textContent = 'Lose! 😭'
    }

    gameEndDiv.style.display = 'flex'
  }
}

const config = {
  type: Phaser.WEBGL,
  width:sizes.width,
  height:sizes.height,
  canvas:document.getElementById('gameCanvas') as HTMLCanvasElement,
  physics: {
    default: "arcade",
    arcade:{
      gravity:{y:speedDown},
      debug: true,
    }
  },
  scene:[GameScene],
}

const game = new Phaser.Game(config)

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = 'none'
  game.scene.resume('scene-game')
})
