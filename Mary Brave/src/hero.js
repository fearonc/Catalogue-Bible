import Config from './config'
import Shared from './shared'
import { bind, unbind, LEFT, RIGHT, picked, fire, inWater } from './utils'
import { rightBlock, leftBlock, topBlock, downBlock, xyBlock, xyBlockPosX } from './blocks'
import { Sprite, draw as drawSprite, update as updateSprite, setImg } from './sprite'
import { updateObjs, room } from './rooms'
import { play, stop } from './sounds'

const HIT_DELAY = 150
const WATER_FADE_PERIOD = 1000

export function Hero() {
  const hero = {
    t: 0,
    v: 0,
    dir: RIGHT,
    jumpStartTime: 0,
    isJumping: false,
    coyoteTime: 0,
    pressed: { a: false, d: false, w: false, q: false },
    sprite: Sprite(...Config.hero),
    dustSprite: Sprite(...Config.dust),
    dust: false,
    life: Config.startLifes,
    bullets: Config.startBullets,
    gun: Config.hasGun,
    key: Config.hasKey,
    fire: false,
    hit: false,
    hitTime: performance.now(),
    lendBefore: false,
    handlers: [],
    stepSound: Config.sounds.steps,
    waterStepSound: Config.sounds.waterSteps,
    waterStepTime: 0,
    stepSpeed: Config.stepSpeed,
    inWater: false, // bool | id
    inWaterTime: 0,
    listeners: Array(1),
    climb: false
  }
  rebind(hero)
  hero.listeners[0] = [Shared.obs, 'rebind', rebind.bind(null, hero)]

  return hero
}

export function draw(h) {
  drawSprite(h.sprite)
  h.inWaterTime && drawOxigen(h)
  h.dust && !h.inWater && drawSprite(h.dustSprite)
}

export function update(h) {
  const t = performance.now()
  const s = h.sprite
  const dt = (t - (h.t || (h.t = t))) / (Config.jumpSpeed * 100)
  h.climb = false

  // climb
  h.pressed.q && !xyBlock(s.x, s.y + s.height + 2) ? climb(h, dt) : stop(Config.sounds.friction)

  // jump
  if (h.isJumping) {
    // this is how we track if user press jump key longer to jump higher
    h.pressed.w && t - h.jumpStartTime < Config.jumpPressTimeMs && (h.v += dt * (Config.jumpVelocity / Config.gravity))
    s.img = s.imgs[`jump${h.gun ? 'Gun' : ''}${side(h)}`]
    updateY(h, s.y + dt * h.v, dt)
  }

  // walk: x += (t - h.t) * Config.stepSpeed * h.dir
  if ((h.pressed.d || h.pressed.a) && !h.climb) {
    updateX(h, s.x + (t - h.t) * h.stepSpeed * h.dir)
    h.stepSpeed = h.inWater ? Config.stepSpeed / 2 : Config.stepSpeed
    if (!h.isJumping) {
      s.img = s.imgs[`walk${h.gun ? 'Gun' : ''}${side(h)}`]
      if (h.lendBefore) {
        h.stepSound.volume = h.waterStepSound.volume = Shared.volume
        play(h.inWater ? h.waterStepSound : h.stepSound)
        if (h.inWater) h.waterStepTime = performance.now()
        else fadeWater(h)
      }
    }
  } else fadeWater(h)

  // idle
  !h.isJumping && !h.pressed.d && !h.pressed.a && !h.climb && (s.img = s.imgs[`idle${h.gun ? 'Gun' : ''}${side(h)}`])

  // fall
  !h.isJumping && !h.climb && updateY(h, s.y + Config.fallSpeed * dt, dt)

  // hit
  if (h.hit) {
    if (picked('foundBraveMushroom', false)) play(Shared.sounds.hitMushroom), h.hit = false
    else {
      play(Shared.sounds.hit)
      if (--h.life < 1) {
        stop(h.waterStepSound)
        Shared.stop = Config.gameOverId
        setTimeout(() => location.replace(`${location.origin}?c`), Config.replayPeriod)
      }
      h.hit = false
      h.hitTime = t
    }
  }

  // hit flashing
  h.hitTime && t - h.hitTime < HIT_DELAY ? setImg(h.sprite, `idleHit${side(h)}`) : h.hitTime = 0

  // fire
  h.fire && (Shared.bullet.hidden = false, h.fire = false, h.bullets--)

  // under water
  if (h.inWater && inWater(s.x, s.y - 1)) {
    const t = performance.now()
    !h.inWaterTime && (h.inWaterTime = t)
    if (t - h.inWaterTime > Config.underWaterTime) h.hit = true, h.inWaterTime = t
    h.dust = false
  } else h.inWaterTime = 0

  // in water
  h.inWater && (h.dust = false)

  // dust
  if (h.dust) {
    const ds = h.dustSprite
    updateSprite(ds)
    h.dust = ds.imgs.idle.frames.frame < ds.imgs.idle.frames.amount - 1
  }

  updateScreen(h)
  updateSprite(s)
  h.t = t
}

function rebind(h) {
  unbind(h.handlers)
  h.pressed = { a: false, d: false, w: false }
  const keyCfg = { keydown: {}, keyup: {} }
  keyCfg.keydown[Config.leftKey]  = () => (h.pressed.a = true, h.dir = LEFT)
  keyCfg.keydown[Config.rightKey] = () => (h.pressed.d = true, h.dir = RIGHT)
  keyCfg.keydown[Config.jumpKey]  = onJumpKeyDown.bind(null, h)
  keyCfg.keydown[Config.fireKey]  = onFire.bind(null, h)
  keyCfg.keydown[Config.climbKey] = () => h.pressed.q = true
  keyCfg.keyup[Config.leftKey]    = () => (h.pressed.a = false, h.pressed.d && (h.dir = RIGHT))
  keyCfg.keyup[Config.rightKey]   = () => (h.pressed.d = false, h.pressed.a && (h.dir = LEFT))
  keyCfg.keyup[Config.jumpKey]    = () => h.pressed.w = false
  keyCfg.keyup[Config.climbKey]   = () => h.pressed.q = false
  h.handlers = bind(keyCfg)
}

function onJumpKeyDown(h) {
  if (h.isJumping) { h.pressed.w = true; return }
  h.sprite.y++
  const pos = downBlock(h.sprite)
  const now = performance.now()
  h.sprite.y--
  if (!h.pressed.w && (h.climb || pos || ((!pos || !h.climb) && now - h.coyoteTime < Config.coyoteDelayMs))) {
    play(Config.sounds.jump)
    h.v = Config.jumpVelocity
    h.isJumping = true
    h.jumpY = h.sprite.y
    h.jumpStartTime = now
    h.climb = h.pressed.q = false
    h.sprite.imgs.jumpLeft.frames.frame = h.sprite.imgs.jumpRight.frames.frame = 0
  }
  h.pressed.w = true
}

function onFire(h) {
  if (h.gun && h.bullets > 0) {
    if (!h.inWater) h.fire = true
    else play(Config.sounds.missfire)
  }
}

function updateX(hero, newX) {
  const s = hero.sprite
  let diff = newX - s.x
  Math.abs(diff) > Config.spriteSize && (diff = (Config.spriteSize - 1) * Math.sign(diff))
  const left = diff < 0
  s.x += diff
  const pos = left ? leftBlock(s, false) : rightBlock(s, false)
  pos && (s.x = left ? pos[0] + 1 : pos[0] - s.width - 1)
}

function updateY(h, newY, dt) {
  const s = h.sprite
  let diff = newY - s.y
  Math.abs(diff) > Config.spriteSize && (diff = (Config.spriteSize - 1) * Math.sign(diff))
  const down = diff > 0
  s.y += diff
  const pos = down ? downBlock(s, false) : topBlock(s, false)
  if (pos) {
    if (down) s.y = pos[1] - s.height - 1, h.coyoteTime = performance.now(), h.v = 0
    else { // hitting the ceiling      
      h.v = h.jumpStartTime = 0
      s.y = pos[1] + 1
    }
    h.isJumping && down && (h.isJumping = false)
    // lending
    if (!h.lendBefore && down && !h.inWater) {
      play(Config.sounds.lending)
      h.dustSprite.x = s.x + s.width / 2 - h.dustSprite.width / 2 + 3
      h.dustSprite.y = s.y + s.height - h.dustSprite.height + 2
      h.dustSprite.imgs.idle.frames.frame = 0
      h.dust = true
    }
  } else h.isJumping && h.jumpY < newY && (h.isJumping = false)

  h.v += Config.gravity * dt
  h.lendBefore = !!pos
}

function updateScreen(h) {
  const s = h.sprite

  if (s.x > Config.width) {
    const r = room()
    Shared.offsX += Config.width
    s.x = -s.width / 2
    updateObjs(r, room())
    fire('change-room')
  } else if (s.x + s.width < 0) {
    const r = room()
    Shared.offsX -= Config.width
    s.x = Config.width - s.width / 2
    updateObjs(r, room())
    fire('change-room')
  } else if (s.y > Config.height) {
    const r = room()
    Shared.offsY += Config.height
    s.y = -s.height / 2
    h.isJumping = false
    updateObjs(r, room())
    fire('change-room')
  } else if (s.y + s.height < 0) {
    const r = room()
    Shared.offsY -= Config.height
    h.jumpY = Config.height + h.jumpY
    s.y = Config.height - s.height / 2
    updateObjs(r, room())
    fire('change-room')
  }
}

function side(hero) {
  return hero.dir === LEFT ? 'Left' : 'Right'
}

function fadeWater(h) {
  if (performance.now() - h.waterStepTime > WATER_FADE_PERIOD) stop(h.waterStepSound)
    else {
      let v = h.stepSound.volume - .0166      
      h.waterStepSound.volume = h.stepSound.volume = (v < 0 ? v = 0 : v)
    }
}

function drawOxigen(h) {
  const s = h.sprite
  const d = (Config.underWaterTime - (performance.now() - h.inWaterTime)) / 200
  Shared.ctx.fillStyle = Config.oxigenColor
  Shared.ctx.fillRect(s.x - 10, s.y - 10, d , 4)
}

function climb(h, dt) {
  const s = h.sprite
  const y = s.y + s.height / 2
  let x
  if (xyBlock(s.x - Config.climbSize, y)) h.climb = 'Left', x = xyBlockPosX(s.x - Config.climbSize, y)
  else if (xyBlock(s.x + s.width + Config.climbSize, y)) h.climb = 'Right', x = xyBlockPosX(s.x + s.width + Config.climbSize, y)
  if (h.climb) {
    h.isJumping = false
    s.img = s.imgs[`climb${h.climb}`]
    updateY(h, s.y + dt * Config.climbFallSpeed, dt)
    s.x = x + (h.climb === 'Left' ? Config.spriteSize + 1 : -s.width - 1)
    h.v = 0
    h.coyoteTime = performance.now()
    play(Config.sounds.friction)
  }
}