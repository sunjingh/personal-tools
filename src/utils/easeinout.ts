const easeIn = (curtime: number, begin: number, end: number, duration: number) => {
  const x = curtime / duration
  const y = x * x
  return begin + (end - begin) * y
}

const easeOut = (curtime: number, begin: number, end: number, duration: number) => {
  const x = curtime / duration
  const y = -x * x + 2 * x
  return begin + (end - begin) * y
}

const easeInout = (curtime: number, begin: number, end: number, duration: number) => {
  if (curtime < duration / 2) {
    return easeIn(curtime, begin, (begin + end) / 2, duration / 2)
  } else {
    const curtime1 = curtime - duration / 2
    const begin1 = (begin + end) / 2
    return easeOut(curtime1, begin1, end, duration / 2)
  }
}

export default easeInout
