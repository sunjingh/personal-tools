<template>
  <div class="clock">
    <canvas :id="cid" class="clock_canva" width="800" height="800"></canvas>
  </div>
</template>

<script setup lang="ts">
import easeInout from '@/utils/easeinout'

const props = withDefaults(defineProps<{
  cid: string,
  msg: string,
  bg: boolean,
  ampm?: boolean,
}>(), {
  msg: '13',
  bg: true,
})

const data = reactive<{
  r: number,
  fontSize: number,
  fontFamily: string,
  flipping: boolean,
  tempVal: string,
  tempAp: string,
  ctx: CanvasRenderingContext2D | null
}>({
  r: 64,
  fontSize: 660,
  fontFamily: 'Arial',
  flipping: false,
  tempVal: '08',
  tempAp: 'AM',
  ctx: null
})
const getAp = () => {
  const res: { ap?: string, num?: string } = {}
  res.ap = ''
  res.num = props.msg
  if (props.ampm && typeof (props.msg) === 'number') {
    if (props.msg < 13) {
      res.ap = 'AM'
    } else if (props.msg < 24) {
      res.ap = 'PM'
      res.num = String(Number(res.num) - 12)
    }
  }
  return res
}
const init = () => {
  const canvas = document.querySelector<HTMLElement>(`#${props.cid}`) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  data.ctx = ctx
  console.log('init')
  ctx.translate(0, 400)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'normal bold ' + data.fontSize + 'px ' + data.fontFamily
  const { ap, num } = getAp()
  data.tempAp = ap ?? 'AM'
  data.tempVal = String(num) ?? '08'
  drawPage(String(num), ap!, true)
  drawPage(String(num), ap!, false)
}
const clipArea = (up: boolean) => {
  const ctx = data.ctx
  if (!ctx) return
  const r = data.r
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(800, 0)
  if (up) {
    ctx.lineTo(800, r - 400)
    ctx.quadraticCurveTo(800, -400, 800 - r, -400)
    ctx.lineTo(r, -400)
    ctx.quadraticCurveTo(0, -400, 0, r - 400)
  } else {
    ctx.lineTo(800, 400 - r)
    ctx.quadraticCurveTo(800, 400, 800 - r, 400)
    ctx.lineTo(r, 400)
    ctx.quadraticCurveTo(0, 400, 0, 400 - r)
  }
  ctx.clip()
}
const gradient = (ctx: CanvasRenderingContext2D, c1: string, c2: string) => {
  const lg = ctx.createLinearGradient(0, -400, 0, 400)
  lg.addColorStop(0, c1)
  lg.addColorStop(1, c2)
  return lg
}
const drawBg = () => {
  const ctx = data.ctx
  if (!ctx) return
  ctx.fillStyle = gradient(ctx, '#161616', '#0c0c0c')
  ctx.fillRect(0, -400, 800, 800)
}
const drawAmpm = (ap: string) => {
  const ctx = data.ctx
  if (!ctx) return
  // console.log('ap', ap)
  const x = 100; const y = 264
  ctx.save()
  ctx.font = 'normal bold 80px ' + data.fontFamily
  if (ap === 'AM') {
    ctx.fillStyle = '#bbbbbb'
    ctx.fillText(ap, x, -y)
  } else {
    ctx.fillStyle = '#b9b9b9'
    ctx.fillText(ap, x, y)
  }
  ctx.restore()
}
const drawText = (s: string) => {
  const ctx = data.ctx
  if (!ctx) return
  ctx.fillStyle = gradient(ctx, '#bcbcbc', '#b8b8b8')
  ctx.fillText(s, 400, 0)
}
const blackLine = (w = 12) => {
  const ctx = data.ctx
  if (!ctx) return
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, -w / 2, 800, w)
}
const drawPage = (s: string, ap: string, up = true, sy = 1) => {
  const ctx = data.ctx
  if (!ctx) return
  ctx.save()
  ctx.scale(1, sy) // scale Y
  clipArea(up)
  if (props.bg) drawBg()
  else ctx.clearRect(0, -400, 800, 800)
  if (props.ampm) drawAmpm(ap)
  drawText(s)
  blackLine()
  ctx.restore()
}
const drawFlip = () => {
  if (data.flipping) return
  data.flipping = true
  const timer = new Date().getTime()
  const duration = 600
  const { ap, num } = getAp()
  const flipping = () => {
    const temp = new Date().getTime()
    const t = temp - timer
    if (t > duration) {
      data.flipping = false
      data.tempVal = String(num) ?? '08'
      data.tempAp = ap ?? 'AM'
      drawPage(String(num), ap!)
      drawPage(String(num), ap!, false)
      return
    }
    let drawUp = true // Page turning is done and draw it again
    const pi = Math.PI
    const sy = Math.sin(easeInout(t, -90, 90, duration) * pi / 180)
    if (t < duration / 2) {
      drawPage(String(num), ap!)
      drawPage(data.tempVal, data.tempAp, true, -sy)
    } else {
      if (drawUp) {
        drawUp = false
        drawPage(String(num), ap!)
      }
      drawPage(data.tempVal, data.tempAp, false)
      drawPage(String(num), ap!, false, sy)
    }
    requestAnimationFrame(flipping)
  }
  flipping()
}
onMounted(() => {
  init()
  // drawFlip()
})
watch([() => props.msg, () => props.ampm],
  () => {
    // console.log('watch', props.msg, props.ampm)
    drawFlip()
  })
watch(() => props.bg, () => { drawFlip() })
</script>

<style scoped lang="scss">
.clock {
  width: 240px;
  height: 240px;
}

.clock_canva {
  width: 100%;
  height: 100%;
}
</style>
