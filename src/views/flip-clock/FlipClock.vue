<template>
  <div class="bg">
    <div class="timer"
      :style="{ 'transform': 'translateY(-50%) scale(' + (data.scale / 100) + ')', 'filter': 'brightness(' + data.brightness / 100 + ')' }">
      <CfcClock :class="[data.showSecond ? 'timer_hms' : 'timer_hm']" cid="clock_h" :msg="data.num_h"
        :ampm="data.hourFormat === 0" :bg="data.showBg"></CfcClock>
      <CfcClock :class="[data.showSecond ? 'timer_hms' : 'timer_hm']" cid="clock_m" :msg="data.num_m" :bg="data.showBg">
      </CfcClock>
      <CfcClock v-if="data.showSecond" :class="[data.showSecond ? 'timer_hms' : 'timer_hm']" cid="clock_s"
        :msg="data.num_s" :bg="data.showBg">
      </CfcClock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getClock, zeroNum } from '@/utils/getnum'
const data = reactive<{
  num_h: string,
  num_m: string,
  num_s: string,
  hourFormat: number,
  scale: number,
  brightness: number,
  showBg: boolean,
  showSecond: boolean,
  timeMode: number,
  tempTime: number,
  stopTime: number,
  watching: boolean,
}>({
  // clock content
  num_h: '你',
  num_m: '好',
  num_s: '!',
  // setting
  hourFormat: 0, // 12h 24h 024h
  scale: 100,
  brightness: 100,
  showBg: true,
  showSecond: true,
  timeMode: 0, // clock timer stopWatch
  tempTime: 0,
  stopTime: 0,
  watching: true,
})
const formatNum = (n: string) => {
  if (data.hourFormat < 2) {
    return String(n)
  } else {
    return zeroNum(Number(n))
  }
}
const _getTimer = () => {
  if (data.watching) {
    const temp = new Date().getTime()
    let t = data.tempTime - temp
    if (t <= 0) return { h: 'ok', m: 'ok', s: 'ok' }
    t = parseInt(String(t / 1000))
    const h = String(parseInt(String(t / 3600)))
    const m = String(parseInt(String(t / 60)) % 60)
    const s = String(t % 60)
    return { h, m, s }
  } else {
    return {
      h: data.num_h,
      m: data.num_m,
      s: data.num_s
    }
  }
}
const _stopWatch = () => {
  if (data.watching) {
    const temp = new Date().getTime()
    let t = temp - data.tempTime
    t = parseInt(String(t / 1000))
    const h = parseInt(String(t / 3600))
    const m = parseInt(String(t / 60)) % 60
    const s = t % 60
    return { h: String(h), m: String(m), s: String(s) }
  } else {
    return {
      h: data.num_h,
      m: data.num_m,
      s: data.num_s
    }
  }
}
setInterval(() => {
  let res: { h: string; m: string; s: string } = { h: '', m: '', s: '' }
  const m = data.timeMode
  if (m === 0) {
    res = getClock()
  } else if (m === 1) {
    res = _getTimer()
  } else if (m === 2) {
    res = _stopWatch()
  }
  data.num_h = formatNum(res.h)
  data.num_m = zeroNum(Number(res.m))
  data.num_s = zeroNum(Number(res.s))
}, 200)
</script>

<style scoped lang="scss">
.bg {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000;

  .timer {
    position: absolute;
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-evenly;

    .timer_hm {
      width: 47.5vw;
      height: 47.5vw;
    }

    .timer_hms {
      width: 30vw;
      height: 30vw;
    }
  }


}
</style>
