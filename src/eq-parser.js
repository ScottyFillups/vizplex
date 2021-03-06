export default function eqParser (eq) {
  var noiseRegex = /([^i]|^)n/g   // match all ns, except ns in sin
  var argsRegex = /(x|y)/g        // match all x/y
  var floatRegex = /([^c]|^)([-]?\d+(\.\d+)?)/g    // match all integers, except 3 in vec3
  var matches = []
  var match

  while ((match = noiseRegex.exec(eq)) !== null) {
    matches.push(match.index)
  }
  matches.forEach((elem) => {
    var p = -1
    // index is position prior to n, so we need to skip 3 to get to content
    for (var i = elem + 3; i < eq.length; i++) {
      if (eq[i] === ')') {
        p++
        if (p === 0) {
          eq = eq.slice(0, i) + ')' + eq.slice(i)
        }
      }
      else if (eq[i] === '(') {
        p--
      }
    }
  })
  return eq.replace(noiseRegex, '$1%NOISE%(vec3')
           .replace(argsRegex, 'gl_FragCoord.$1')
           .replace(floatRegex, function (match, pre, num) {
             num = Number(num)
             return (num % 1 === 0) ? `${pre}${num}.0` : `${pre}${num}`
           })
}
