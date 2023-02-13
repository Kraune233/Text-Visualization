
let loadbar = 0;
let failedLoads = [];

//don't forget to add a comma after each line, unless it's the last one in the array
let jsonDocuments = [
  "./json/Dickens.json",
  "./json/Short1.json",
  "./json/WebScraping.json",
  "./json/Copyright.json",
  "./json/DeathOfTheAuthor.json"
];

let canvas;
let files = [];
let phrases = [];
let words = [];
let displayText = "";

//ADD you data structures for text generation here
let markovChain = {};


function setup() {
  canvas = createCanvas(500, 500);
  canvas.parent("sketch-container"); //move our canvas inside this HTML element
  canvas.mouseMoved(handleCanvasMoved);//only respond to mouse moved on the canvas element

  //start loading the first file in the array
  loadFile(0);
}

function draw() {
  background(200);

  if(loadbar < jsonDocuments.length){
    let barLength = width*0.5;
    let length = map(loadbar,0,jsonDocuments.length,barLength/jsonDocuments.length,barLength);
    rect(width*0.25,height*0.5,length,20);
  }else{

    let fontSize = map(displayText.length,0,200,30,20,true);
    textSize(fontSize);
    textWrap(WORD);
    textAlign(CENTER);

    //rotate the text
    for (let i = 1; i < 10; i++) {   
      push();
      translate(width/2, height/2);
      rotate(radians(frameCount * i * 0.2));
      fill(40, random(0, 255), 255);
      text(displayText, mouseX/2-200, mouseY/2-200); 
      pop();
    }
    //text(displayText,50, 50, 400);

  }

}


function handleCanvasMoved(){
  //original text
  displayText = "Don't show this boring sentence, generate some text instead!";

  //generate text to set value of displayText here
  //displayText = generateCutUpPhrases(3);
  let keys = getMarkovKeys();
  displayText =  generateMarkovText(randomChoice(keys), 40);

  //show text in HTML  
  showText(displayText);

}


function buildModel(){
  /*
  //change this code to add the text into the appropriate data structure for each text generator
  for(let i = 0; i < files.length; i++){ 

    let textPhrases = files[i].text.split(/(?=[,.])/);// only split on commas

    for (j = 0; j < textPhrases.length; j++) {
      //removes everything (g flag) except letters, whitespace & '
      let punctuationless = textPhrases[j].replace(/[^a-zA-Z- ']/g,"");
      //to lowercase
      let lowerCase = punctuationless.toLowerCase();
      //remove whitespace
      let trimmed = lowerCase.trim();

      phrases.push(trimmed);
    }
   
   // console.log(files[i].text);
  } 
  */
 clearMarkovChain();
  for(let i = 0; i < files.length; i++){ 
    let text = files[i].text;  
    markovChain = addWordsToMarkov(markovChain, text);
  }

}

//Text Generator Functions ----------------------------------
//ADD YOUR CODE FOR THE THREE NEW FUNCTIONS HERE:
function generateCutUpPhrases(numPhrases){
  let output = "";

   //implement your code to generate the output
  for(let i = 0; i < numPhrases; i++){
    let randomIndex = int(random(0, phrases.length));
    let randomPhrase = phrases[randomIndex];
    
    output += randomPhrase + ". ";
  }

  return output;
}

function generateWordMangle(numWords){
  let output = "";

  //implement your code to generate the output
  for (let i =0; i < numWords; i++) {
    let randomWord = randomChoice(phrases);

    output += randomWord + " ";
  }
  return output;
}

function generateMarkovText(startWord,numWords){

  let current = startWord;
  let output = current;

  for (let i =0; i < numWords; i++) {
    if (markovChain.hasOwnProperty(current)) {
      // What are all the possible next tokens
      let possibleNexts = markovChain[current];
      let next;
      // Pick one randomly out of the "bucket" of choices
      if(possibleNexts.length == 0){
        possibleNexts = getMarkovKeys();
      }

      next = randomChoice(possibleNexts);

      output +=" " + next; 
      current = next;
    } else { 
    // do something
    }
  }
  //implement your code to generate the output
  return output;
}




//Generic Helper functions ----------------------------------


function loadFile(index){

  if(index < jsonDocuments.length){
    let path = jsonDocuments[index]; 

    fetch(path).then(function(response) {
      return response.json();
    }).then(function(data) {
    
      console.log(data);
      files.push(data);

      showText("Training text number " + (index+1));
      showText(data.text);
  
      loadbar ++;
      loadFile(index+1);
  
    }).catch(function(err) {
      console.log(`Something went wrong: ${err}`);
  
      let failed = jsonDocuments.splice(index,1);
      console.log(`Something went wrong with: ${failed}`);
      failedLoads.push(failed);// keep track of what failed
      loadFile(index); // we do not increase by 1 because we spliced the failed one out of our array

    });
  }else{
    buildModel();//change this to whatever function you want to call on successful load of all texts
  }

}


//add text as html element
function showText(text){

  let textContainer = select("#text-container");
  let p = createP(text);
  p.parent("text-container");
//  textContainer.elt.innerHTML = "";//add this in if you want to replace the text each time
}

function randomChoice(array) {
  //randomIndex returns 0 - array.length-1 as 
  //Random range: If two arguments are given, returns a random number from the first argument up to (but not including) the second argument. 
  let randomIndex = int(random(0,array.length));
  let randomWord = array[randomIndex];

  return randomWord;
}
  
function clean(text){
  //good place to test your regex
  //https://regex101.com/ 
  let removeHTMlNewLine = text.replace(/\n/g," ");
  let punctuationless = removeHTMlNewLine.replace(/[^a-zA-Z- ']/g,"");//everything except letters, whitespace & '
  let cleanText = punctuationless.replace(/\s{2,}/g," ");
  let lowerCase = cleanText.toLowerCase().trim();//lower case and remove white spaces at start and end
  
  return lowerCase;
}

function tokenise(text,seperator){
  let tokens = text.split(seperator);

  return tokens;
}


//Markov Helper Functions ----------------------------------

function getMarkovKeys(){
  let keys = Object.keys(markovChain);

  return keys;
}

//easiest way to start again
//call to wipe out previous data to "re-train"
function clearMarkovChain(){
  markovChain = {};
}

  // A function to feed in text to the markov chain
function addWordsToMarkov(markovModel,text) {

  text = clean(text);
  let words = tokenise(text," ");

  // Now let's go through everything and create the dictionary
  for (let i = 0; i < words.length; i++) {
    let word = words[i].trim();//trim any whitespace in case we missed it

    // Is this a new one?
    if (!markovModel.hasOwnProperty(word)) {
      markovModel[word] = [];
    }

    //check if we aren't yet on the last one before trying to grab the next
    if(i < words.length-1){
      let next = words[i+1];
      // Add to the list
      markovModel[word].push(next);
    }

  }

  return markovModel;

}

