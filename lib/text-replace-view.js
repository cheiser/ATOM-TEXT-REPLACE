'use babel';

export default class TextReplaceView {

  constructor(serializedState) {
    this.openedTimes = 0;
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('text-replace');
    editor = atom.workspace.getActiveTextEditor();
    var selectedText = editor.getSelectedText();

    // Create message element
    const message = document.createElement('div');
    // message.textContent = selectedText;
    message.textContent = ((selectedText.indexOf("\n") > -1) ? "contains newline" : "no newline") + selectedText.length;
    message.classList.add('message');
    this.element.appendChild(message);

    // Create text-area element which contain the text that has something that is to be replaced
    const txtArea = document.createElement('atom-text-editor');
    // txtArea.setAttribute("mini", "");
    // txtArea.setAttribute("placeholder-text", "Search");
    txtArea.id = "originalText";
    // txtArea.textContent = 'The TextReplace package is Alive! It\'s ALIVE!';
    // var t = document.createTextNode("TEXT");
    // txtArea.appendChild(t);
    // txtArea.classList.add('txtArea');
    // txtArea.style = "";
    // txtArea.innerHTML = "TEXT";
    txtArea.rows = 3;
    txtArea.cols = 100;
    this.element.appendChild(txtArea);

    // Create text-area element with the filtering to be used. Or we specified
    // what is to be replaced in the txtArea
    // const fltArea = document.createElement('textarea');
    const fltArea = document.createElement('atom-text-editor');
    fltArea.setAttribute("mini", "");
    fltArea.setAttribute("placeholder-text", "Filter");
    fltArea.id = "filterText";
    // txtArea.textContent = 'The TextReplace package is Alive! It\'s ALIVE!';
    // var t = document.createTextNode("TEXT");
    // txtArea.appendChild(t);
    // txtArea.classList.add('txtArea');
    // txtArea.style = "";
    // fltAreaModel = fltArea.getModel();
    // fltAreaModel.setText("my text");
    // textInArea = fltAreaModel.getText();
    // console.log("textInArea: " + textInArea);

    fltArea.rows = 1;
    fltArea.cols = 100;
    this.element.appendChild(fltArea);


    // Create text-area element where we specify what to replace the word with
    // if we choose that button
    const rplcArea = document.createElement('atom-text-editor');
    rplcArea.setAttribute("mini", "");
    rplcArea.setAttribute("placeholder-text", "Replace");
    rplcArea.id = "replaceText";
    // txtArea.textContent = 'The TextReplace package is Alive! It\'s ALIVE!';
    // var t = document.createTextNode("TEXT");
    // txtArea.appendChild(t);
    // txtArea.classList.add('txtArea');
    // txtArea.style = "";
    // rplcArea.innerHTML = "replace";
    rplcArea.rows = 1;
    rplcArea.cols = 100;
    this.element.appendChild(rplcArea);


    // Create button for index modification
    const indexBtn = document.createElement("button");
    indexBtn.id = "indexButton1";
    // indexBtnTxt.id = "indexButton1Txt"
    indexBtn.innerHTML = "INDEX";
    _this = this;
    indexBtn.addEventListener("click", function(event){ indexBtnEHandler(event, _this); });
    this.element.appendChild(indexBtn);

    // Create button for specific replace
    const replaceBtn = document.createElement("button");
    replaceBtn.id = "replaceButton1";
    replaceBtn.innerHTML = "REPLACE";
    _this = this;
    replaceBtn.addEventListener("click", function(event){ replaceBtnEHandler(event, _this); });
    this.element.appendChild(replaceBtn);
  }
  //
  // constructor(serializedState) {
  //   this.openedTimes = 0;
  //   // Create root element
  //   this.element = document.createElement('div');
  //   this.element.classList.add('text-replace');
  //   editor = atom.workspace.getActiveTextEditor();
  //   var selectedText = editor.getSelectedText();
  //
  //   // Create message element
  //   const message = document.createElement('div');
  //   // message.textContent = selectedText;
  //   message.textContent = ((selectedText.indexOf("\n") > -1) ? "contains newline" : "no newline") + selectedText.length;
  //   message.classList.add('message');
  //   this.element.appendChild(message);
  //
  //   // Create text-area element
  //   const txtArea = document.createElement('textarea');
  //   txtArea.id = "replaceText";
  //   // txtArea.textContent = 'The TextReplace package is Alive! It\'s ALIVE!';
  //   // var t = document.createTextNode("TEXT");
  //   // txtArea.appendChild(t);
  //   // txtArea.classList.add('txtArea');
  //   // txtArea.style = "";
  //   txtArea.innerHTML = "TEXT";
  //   txtArea.rows = 1;
  //   txtArea.cols = 100;
  //   this.element.appendChild(txtArea);
  //
  //
  //   // Create button for index modification
  //   const indexBtn = document.createElement("button");
  //   indexBtn.id = "indexButton1";
  //   var indexBtnTxt = document.createTextNode(this.openedTimes);
  //   indexBtnTxt.id = "indexButton1Txt"
  //   indexBtn.appendChild(indexBtnTxt);
  //   _this = this;
  //   indexBtn.addEventListener("click",
  //     function(event){
  //       atom.beep();
  //       console.log(_this.openedTimes);
  //       document.getElementById("indexButton1").innerHTML = "" + _this.openedTimes;
  //     });
  //   this.element.appendChild(indexBtn);
  // }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}


function indexBtnEHandler(event, _this) {
  var editor = atom.workspace.getActiveTextEditor();

  var originalText = document.getElementById("originalText").getModel().getText(); // the long text
  // containing the indexes that is to be incrementally replaced
  var replacedText = originalText;

  // find all the [] in the text and if two of the same are following each other or it simply
  // is a repetition, then see if it starts with something different or if it ends with something
  // different. E.g. x[0].foobar() and y[0].func() are completely different and should not be updated.
  // might also have conditions such as array1[array2[0]] etc....
  // maybe a tree structure would make it easier to handle?

  // see if the thing between "[]" is a number and if it is, then see if it falls within two other "[]"
  bracketPoss = findOpeningClosingBrackets(originalText);
  beforeIndexAfter = []; // hold arrayName[index].functionName, or before[index]after. I.e.
  // beforeIndexAfter[0] = before, [1] = index, [2] = after, [3] = op brack pos, [4] = closing brack pos,
  // [5] = bracketPoss index for the brackets

  for(var i = 0; i < bracketPoss.length; i++){
    // console.log("bracketPoss " + i + " opening: " + bracketPoss[i][0] + " closing: " + bracketPoss[i][1]);
    // if(isNumeric(originalText.substr(bracketPoss[i][0], bracketPoss[i][1]))){
    //   // number inside brackets
    //   var number = float(originalText.substr(bracketPoss[i][0], bracketPoss[i][1]));
    // }
    // from the opening bracket position, backtrack in the originalText until space, ., bracket or bound
    beforeIndex = stepThrough(originalText, bracketPoss[i][0]-1, -1);
    afterIndex = stepThrough(originalText, bracketPoss[i][1]+1, 1);
    beforeText = originalText.substring(beforeIndex, bracketPoss[i][0]);
    afterText = originalText.substring(bracketPoss[i][1], afterIndex);
    indexText = originalText.substring(bracketPoss[i][0]+1, bracketPoss[i][1]);
    // console.log("afterIndex at " + i + ": " + afterIndex);

    beforeIndexAfter[i] = [beforeText, indexText, afterText, bracketPoss[i][0], bracketPoss[i][1], i];
    // TODO: VERIFY THIS WORKS
  }

  // the beforeIndexAfter is filled
  // replace only "index" that is not alone on it's level
  // as soon as an index is encountered we go through the rest of the bia to see if
  // any of those has the same index (and are a number) and are on the same level
  for(var i = 0; i < beforeIndexAfter.length; i++){
    console.log("after at " + i + ": " + beforeIndexAfter[i][2] + " bl: " +
                bracketLevel(beforeIndexAfter[i], bracketPoss));
    var updateValue = parseFloat(beforeIndexAfter[i][1]) + 1;
    for(var j = i + 1; j < beforeIndexAfter.length; j++){
      if((beforeIndexAfter[i][0] == beforeIndexAfter[j][0]) &&
         (beforeIndexAfter[i][1] == beforeIndexAfter[j][1]) &&
         (beforeIndexAfter[i][2] == beforeIndexAfter[j][2])){
           var iLevel = bracketLevel(beforeIndexAfter[i], bracketPoss);
           var jLevel = bracketLevel(beforeIndexAfter[j], bracketPoss);
           console.log("INSIDE THE BIG IF: " + iLevel + " - " + jLevel + isNumeric(beforeIndexAfter[i][1])); // TODO: REMOVE
           if(iLevel == jLevel && isNumeric(beforeIndexAfter[i][1])){
             // replace the index for the index at jLevel with the current counter, assuming the
             // "i" index is 0... or just break after we have encountered this event as another
             // index will trigger us to come in here only with everything increased by one...
             // NOTE: beforeIndexAfter IS NOT UPDATED WITH THE CORRECT VALUES AFTER EACH LOOP

             // NOTE: THE beforeIndexAfter INDICES CHANGES AFTER EACH CHANGE.....
             //  replacedText = replaceStrAt(replacedText, beforeIndexAfter[j][3] + 1,
             //                   beforeIndexAfter[i][1], beforeIndexAfter[j][1].length);
             replacedText = replaceStrAtWithBIAUpdate(replacedText, parseFloat(beforeIndexAfter[j][3]) + 1,
                              updateValue,
                              beforeIndexAfter[j][1].length, beforeIndexAfter, bracketPoss);
             console.log("replacedText at " + i + ", " + j + ": " + replacedText +
                          "with beforeIndexAfter[j][3]: " + (parseFloat(beforeIndexAfter[j][3]) + 1));
             beforeIndexAfter[j][1] = updateValue; // parseFloat(beforeIndexAfter[i][1]) + 1;
             updateValue += 1;
            //  break;
           }
         }
    }
  }

  console.log("replacedText: " + replacedText); // TODO: REMOVE
  editor.insertText(replacedText);
}

function filterBtnEHandler(event, _this) {
  atom.beep();
  console.log("This does not do anything yet");
  // document.getElementById("indexButton1").innerHTML = "" + _this.openedTimes;
}

function replaceBtnEHandler(event, _this) {
  var editor = atom.workspace.getActiveTextEditor();

  var originalText = document.getElementById("originalText").getModel().getText(); // the long text containing
  // that that is to be replaced
  var filterText = document.getElementById("filterText").getModel(); // this is what is to be replaced
  var replaceText = document.getElementById("replaceText").getModel(); // with this

  // search through originalText for filterText and replace those instances with replaceText
  var replacedText = originalText.replace(new RegExp(filterText.getText(), "g"), replaceText.getText());

  editor.insertText(replacedText);
}

function isNumeric(obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj); // if parseFloat fails it returns NaN
}

/**
 * Finds indices of brackets in the string and returns them as a list of list, where given [x][y], the x is
 * the bracket pair index and y has only two elements where y == 0 is the opening brackets position and
 * y == 1 is the closing brackets position.
 * The brackets are sorted so the opening brackets are in the correct order.
 */
function findOpeningClosingBrackets(str){
    var bracketsPositions = [];
    var tempPos = [];
    for(i = 0; i < str.length; i++){
        if(str[i] == "["){
            tempPos.push(i);
        } else if(str[i] == "]"){
            // place opening and closing brackets positions into array
            bracketsPositions.push([tempPos.pop(), i]);
        }
    }

    // return the brackets sorted on the index of the opening brackets
    return bracketsPositions.sort(function(a, b){return a[0]-b[0]});
}

/*
 * Steps through the text, starting from the given startIndex and stepping "step" each loop until
 * it's either out of bounds or until it encounters one of the stop symbols specified in
 * stopSymbolsArray
 */
function stepThrough(text, startIndex, step, stopSymbolsArray){
  step = step || 1;
  stopSymbolsArray = stopSymbolsArray || [" ", ".", "[", "]", "{", "}", "\n", "\t", "\r"];
  var index = startIndex;
  var stopFlag = false;
  while(index >= 0 && index < text.length && !stopFlag){
    for(var i = 0; i < stopSymbolsArray.length; i++){
      if(text[index] == stopSymbolsArray[i]){
        stopFlag = true;
        break;
      }
    }
    index += step;
  }
  index -= step;
  if(stopFlag){
    index -= step;
  }

  return index;
}

/*
 * bia = an entry of the beforeIndexAfter in which the index is the level we try to determine it is on
 * bracketPoss = the array with brackets opening and closing positions
 */
function bracketLevel(bia, bracketPoss){
  // bia[3] = the opening brackets position in the text
  // bia[4] = the closing brackets position in the text
  // bia[5] = the opening/closing brackets position in the bracketPoss array
  // for each entry to the left of this that has an ending bracket which ends to the right of bia[5],
  // add 1 to the bracket level.
  bLevel = 0;

  for(var i = bia[5]; i >= 0; i--){
    if(bracketPoss[i][0] <= bia[3] && bracketPoss[i][1] >= bia[4]){
      bLevel++;
    }
  }

  return bLevel;
}

/*
 * Replaces the character(s) at the specified index
 * orgStr = the original string in which some part should be replaced
 * index = the index in the original string where the replacing should start
 * replaceWith = what should be inserted into the place where the original text to be replaced is
 * replaceLen = the length of that which is to be replaced
 */
function replaceStrAt(orgStr, index, replaceWith, replaceLen){
  replaceLen = replaceLen || replaceWith.length;

  // return orgStr.substring(0, index) + replaceWith + orgStr.substring(index+replaceLen, orgStr.length);
  return orgStr.substring(0, index) + "REPLACED" + orgStr.substring(index+replaceLen, orgStr.length);
}


/*
 * Replaces the character(s) at the specified index and updates the beforeIndexAfter array to be up to
 *   date after the replacement operation
 * orgStr = the original string in which some part should be replaced
 * index = the index in the original string where the replacing should start
 * replaceWith = what should be inserted into the place where the original text to be replaced is
 * replaceLen = the length of that which is to be replaced
 * biaArray = the beforeIndexAfter array which we want to update
 */
function replaceStrAtWithBIAUpdate(orgStr, index, replaceWith, replaceLen, biaArray, bracketPoss){
  replaceLen = replaceLen || replaceWith.length;

  // go through the bia array and for each index which has a brackets that ends after the place where
  // we are inserting the replacement text, we shift with the amount of characters that is the
  // difference between what was there earlier and what we have replaced it with
  // i.e. replaceWith.length - replaceLen
  var shiftLength = (("" + replaceWith).length - replaceLen);
  console.log("(replaceWith).length: " + ("" + replaceWith).length);
  console.log("replaceLen: " + replaceLen + " shift length: " + shiftLength);
  for(var i = 0; i < biaArray.length; i++){
    if(biaArray[i][3] > index+replaceLen){
      // shift
      biaArray[i][3] = biaArray[i][3] + shiftLength;
      bracketPoss[biaArray[i][5]][0] = bracketPoss[biaArray[i][5]][0] + shiftLength;
    }
    if(biaArray[i][4] > index+replaceLen){
      // shift
      biaArray[i][4] = biaArray[i][4] + shiftLength;
      bracketPoss[biaArray[i][5]][1] = bracketPoss[biaArray[i][5]][1] + shiftLength;
    }
  }

  return orgStr.substring(0, index) + replaceWith + orgStr.substring(index+replaceLen, orgStr.length);
  // return orgStr.substring(0, index) + 1 + orgStr.substring(index+replaceLen, orgStr.length);
  // return orgStr.substring(0, index) + "REPLACED" + orgStr.substring(index+replaceLen, orgStr.length);
}
