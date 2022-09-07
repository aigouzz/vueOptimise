let decoder

export default {
  decode(html) {  // string return string
    decoder = decoder || document.createElement('div')
    decoder.innerHTML = html
    return decoder.textContent
  }
}