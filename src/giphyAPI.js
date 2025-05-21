async function gettingAPI() {
  let imgPic = document.querySelector('img')
  let response = await fetch('https://api.giphy.com/v1/gifs/translate?api_key=u9VSCfhJZXs12S0sOtJtef44hUHaPyFR&s=funny', {mode: 'cors'})
  let imagedata = await response.json();
  imgPic.src = imagedata.data.images.original.url
}

export { gettingAPI } 