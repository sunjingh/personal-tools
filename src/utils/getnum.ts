export const zeroNum = (n: number) => {
  const str = n.toString()
  return str[1] ? String(n) : '0' + str
}

export const getClock = () => {
  const t = new Date()
  const h = t.getHours()
  const m = t.getMinutes()
  const s = t.getSeconds()
  return { h: String(h), m: String(m), s: String(s) }
}
