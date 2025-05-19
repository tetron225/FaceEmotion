import quotes from './quotes.js'
//import 

let abutton = document.getElementById('abutton');
let avideo = document.getElementById('avideo');
let astopbutton = document.getElementById('stop');
let statbutton = document.getElementById('statbutton');
let moodbutton = document.getElementById('picturemood') //links to picture mood label
let canvastoggle = document.getElementById('specialbutton')
let wasToggled = false;

function startVid() {
  //mediaDevices returns a MediaDevice object that provides connected devices such as a webcam
  navigator.mediaDevices
    .getUserMedia({
      video: {},
    })
    .then((stream) => {
      //this will load the stream object which is the webcam
      //It will then add a listener and start playing the video (in this case the webcam)

      //if srcObject exists, send a console.log message
      if (avideo.srcObject !== null) {
        console.log('Please turn off before starting a new stream');
      } else {
        //set the srcObject to stream(webcam)
        avideo.srcObject = stream;
        //listens into the video and plays
        avideo.addEventListener('loadedmetadata', () => {
          avideo.play();
        });
        //creates a button that will stop the stream of the video.
        astopbutton.addEventListener('click', () => {
          //stops the stream
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          //replaces the src with null so that it does not conflict if another value gets inserted into src through another click button
          avideo.srcObject = null;
        });
      }
    })
    .catch(alert);
}

async function gettingAPI() {
  let imgPic = document.querySelector('img')
  let response = await fetch('https://api.giphy.com/v1/gifs/translate?api_key=u9VSCfhJZXs12S0sOtJtef44hUHaPyFR&s=funny', {mode: 'cors'})
  let imagedata = await response.json();
  imgPic.src = imagedata.data.images.original.url
}

moodbutton.addEventListener('click', () => {
  if(window.getComputedStyle(imagecontainer).display === 'none') {
    imagecontainer.style.display = 'block'
    gettingAPI();
  }
  else {
    imagecontainer.style.display = 'none'
    imagecontainer.removeAttribute('src')
  }
})

canvastoggle.addEventListener('click', () => {
  if(window.getComputedStyle(canvasdraw).opacity === '0') {
    canvasdraw.style.opacity = '1';
    wasToggled = true;
  } else {
    canvasdraw.style.opacity = '0';
    wasToggled = false;
  }
})

//Once the button is clicked, it will load the needed Uri from the models/weights
//then through a promise, it will start the startVid function
abutton.addEventListener('click', () => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models/weights'),
  ]).then(startVid);
});

statbutton.addEventListener('click', () => {
  //window.getComputedStyle(statcontainer).
      if(window.getComputedStyle(statcontainer).display === 'none') {
        statcontainer.style.display = 'block'
      } else {
        statcontainer.style.display = 'none'
      }
});

avideo.addEventListener('play', () => {
  //using canvas to draw the outlines on the webcam
  //calls the createCanvas function from faceapi to create a canvas within the video element (webcam)
  const canvas = faceapi.createCanvasFromMedia(avideo);
  canvas.setAttribute('id', 'canvasdraw');
  //we append the canvas to the body of the HTML
  let container = document.getElementById('vidcontainer');
  //appends the DOM to the canvas
  container.append(canvas);
  //sets the display size to the avideo value
  const displaySize = { width: avideo.width, height: avideo.height };
  //matches the dimensions of the canvas and the displayed size
  faceapi.matchDimensions(canvas, displaySize);

  //sets the interval so it checks the images for a face recognition every 100 milliseconds
  setInterval(async () => {
    //Passes on the element which is the video webcam(avideo) and which library to use
    //in this case its tinyFaceDetector
    //using withFaceLandmarks to draw the faces on the webcam
    //withFaceExpression will detect whether the image fom webcam is happy, sad, etc.
    const detect = await faceapi
      .detectAllFaces(avideo, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    //resize the face detection and using the displaySize height and width
    const resizeDetections = faceapi.resizeResults(detect, displaySize);

    //wanting to clear out any canvas before redrawing the image
    //getting the context from the canvas (the 2d shape) and clear it
    //clearRect is a canvas method
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
    
    //actually draw the canvas onto the video image
    faceapi.draw.drawDetections(canvas, resizeDetections);
    //draws the canvas to where the face is located
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    //expresses what kind of expression the face is showing
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections);
    if(!wasToggled) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }

    //Unable to find the function to produce the expression labels
    //Opted to use its arrays/objects to find the expressions.
    //expression values have a range from 0 to 1
    //if the expression value is closest to 1, it will show on the canvas
    //extracted the value here and linked to a textContent value in HTML
    
    let expressionList = detect[0].expressions;
    let feeling = '';
    let feelnum = 0;

    for (const keys in expressionList) {
      if (expressionList[keys] > feelnum) {
        feelnum = expressionList[keys];
        feeling = keys;
      }
    }
    //======================================================================================================
    //changed the expression from neutral to calm
    let wordFeeling = feeling;
    switch (feeling) {
      case 'neutral':
        feeling= String.fromCodePoint(0x1f611);
        break;
      case 'happy':
        feeling = String.fromCodePoint(0x1f604);
        break;
      case 'sad':
        feeling = String.fromCodePoint(0x1f622);
        break;
      case 'angry':
        feeling = String.fromCodePoint(0x1f92c);
        break;
      case 'fearful':
        feeling = String.fromCodePoint(0x1f631);
        break;
      case 'disgusted':
        feeling = String.fromCodePoint(0x1f92e);
        break;
      case 'surprised':
        feeling = String.fromCodePoint(0x1f632);
        break;
    }
    const aFeeling = document.getElementById('expression');
    aFeeling.textContent = feeling;
    aFeeling.style.paddingLeft = '10px';
    aFeeling.style.fontSize = '50px';
    //========================================================================================================
    
    let stringFeel = wordFeeling + "Quotes";
    console.log(stringFeel)
    if (quotes[stringFeel]) {
      const quoteArr = quotes[stringFeel]; // Get the array of quotes based on the feeling
      const randomIndex = Math.floor(Math.random() * quoteArr.length); // Pick a random quote
      const selectedQuote = quoteArr[randomIndex]; // Store the selected quote
    
      const quoteElement = document.getElementById('quoteBox'); // Assuming you have an element with id 'quoteBox'
    
      // Check if the quoteElement exists to avoid potential errors
      if (quoteElement) {
        setTimeout(() => { 
          quoteElement.textContent = selectedQuote
          return; 
        }, 1000); // Set the text content of the quote box
        quoteElement.style.fontSize = '20px'; // Set font size or any other style you prefer
        quoteElement.style.padding = '10px'; // Optional: Adding some padding for a better appearance
      } else {
        console.error('Element with id "quoteBox" not found.');
      }
    } else {
      console.error('No quotes available for the selected feeling.');
    }
    
    //=====================================================================================================
    let statcontainer = document.getElementById('statcontainer');

    for(let key in expressionList) {
        if(document.getElementById(key) !== null) {
          if(key === 'neutral') {
            let temp = document.getElementById(key);
            let tempNumber = document.getElementById(`${key + key}`);
            temp.textContent = 'CALM' + ': ' 
            tempNumber.textContent = Math.floor(expressionList[key] * 100) + '%'
            continue;
          }
          let upperText = key
          let temp = document.getElementById(key);
          let tempNumber = document.getElementById(`${key + key}`);
          temp.textContent = upperText.toUpperCase() + ': ';
          tempNumber.textContent = Math.floor(expressionList[key] * 100) + '%'
        } else {
          if(key === 'asSortedArray') {
            continue;
          }

          let tempcontainer = document.createElement('div');
          tempcontainer.setAttribute('id', 'expressioncontain')
          tempcontainer.style.display = 'flex';
          tempcontainer.style.flexDirection = 'row';
          tempcontainer.style.justifyContent = 'space-between';
          let temp = document.createElement('div');
          let tempnumber = document.createElement('div')

          if(key === 'neutral') {
            temp.setAttribute('id', `${key}`);
            tempnumber.setAttribute('id', `${key + key}`)
            temp.textContent = 'CALM' + ': ';
            tempnumber.textContent = Math.floor(expressionList[key] * 100) + '%';
            statcontainer.append(tempcontainer);
            tempcontainer.append(temp);
            tempcontainer.append(tempnumber)
            continue;
          }
          
          temp.setAttribute('id', `${key}`);
          tempnumber.setAttribute('id', `${key + key}`)
          let upperText = key
          temp.textContent = upperText.toUpperCase() + ': ' 
          tempnumber.textContent = Math.floor(expressionList[key] * 100) + '%';
          statcontainer.append(tempcontainer);
          tempcontainer.append(temp);
          tempcontainer.append(tempnumber)
        }
      }

    //======================================================================================================

    
    //aFeeling.style.paddingBottom = '100px';

    //added a second event listener on the same press so that it clears the canvas as well as the srcObject
    astopbutton.addEventListener('click', () => {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    });
  }, 300);
});
