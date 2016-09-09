'use babel';

export default class TextReplaceView {

  constructor(serializedState) {
    this.openedTimes = 0;
    // Create root element
    this.element = document.createElement('div');
    this.element.id = "rootElement";

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
    txtArea.id = "originalText";
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

    fltArea.rows = 1;
    fltArea.cols = 100;
    fltArea.setAttribute("tabindex", "0");
    fltArea.focus();
    this.element.appendChild(fltArea);


    // Create text-area element where we specify what to replace the word with
    // if we choose that button
    const rplcArea = document.createElement('atom-text-editor');
    rplcArea.setAttribute("mini", "");
    rplcArea.setAttribute("placeholder-text", "Replace");
    rplcArea.id = "replaceText";
    rplcArea.rows = 1;
    rplcArea.cols = 100;
    rplcArea.setAttribute("tabindex", "0");
    this.element.appendChild(rplcArea);


    // Create button for index modification
    const indexBtn = document.createElement("button");
    indexBtn.id = "indexButton1";
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

    // Create button for making all the text lower case
    const lowerCaseBtn = document.createElement("button");
    lowerCaseBtn.id = "lowerCaseButton1";
    lowerCaseBtn.innerHTML = "LowerCase";
    _this = this;
    lowerCaseBtn.addEventListener("click", function(event){ caseEHandler(event, _this, true); });
    this.element.appendChild(lowerCaseBtn);

    // Create button for making all the text upper case
    const upperCaseBtn = document.createElement("button");
    upperCaseBtn.id = "upperCaseButton1";
    upperCaseBtn.innerHTML = "UpperCase";
    _this = this;
    upperCaseBtn.addEventListener("click", function(event){ caseEHandler(event, _this, false); });
    this.element.appendChild(upperCaseBtn);

  }

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

/*
 * Handler function for when the index button is pressed.
 *
 * The index button updates the indices for arrays in a text in such a way that for two "entries"
 * that are equivalent, the second entry is increased to the previous index value plus one.
 */
function indexBtnEHandler(event, _this) {
  var editor = atom.workspace.getActiveTextEditor();

  var originalText = document.getElementById("originalText").getModel().getText(); // the long text
  // containing the indexes that is to be incrementally replaced
  var replacedText = originalText;

  bracketPoss = findOpeningClosingBrackets(originalText);
  beforeIndexAfter = []; // hold arrayName[index].functionName, or before[index]after. I.e.
  // beforeIndexAfter[0] = before, [1] = index, [2] = after, [3] = op brack pos, [4] = closing brack pos,
  // [5] = bracketPoss index for the brackets

  for(var i = 0; i < bracketPoss.length; i++){
    // from the opening bracket position, backtrack in the originalText until stopsymbol
    beforeIndex = stepThrough(originalText, bracketPoss[i][0]-1, -1);
    afterIndex = stepThrough(originalText, bracketPoss[i][1]+1, 1);
    beforeText = originalText.substring(beforeIndex, bracketPoss[i][0]);
    afterText = originalText.substring(bracketPoss[i][1], afterIndex);
    indexText = originalText.substring(bracketPoss[i][0]+1, bracketPoss[i][1]);

    beforeIndexAfter[i] = [beforeText, indexText, afterText, bracketPoss[i][0], bracketPoss[i][1], i];
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
             replacedText = replaceStrAtWithBIAUpdate(replacedText, parseFloat(beforeIndexAfter[j][3]) + 1,
                              updateValue,
                              beforeIndexAfter[j][1].length, beforeIndexAfter, bracketPoss);
             console.log("replacedText at " + i + ", " + j + ": " + replacedText +
                          "with beforeIndexAfter[j][3]: " + (parseFloat(beforeIndexAfter[j][3]) + 1));
             beforeIndexAfter[j][1] = updateValue;
             updateValue += 1;
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
}

/*
 * Event handler for the lower and upper case buttons
 *
 * This causes all the selected text to be either uppercase or lowercase, depending
 * on which button is pressed.
 */
function caseEHandler(event, _this, toLowerCase) {
  var editor = atom.workspace.getActiveTextEditor();
  var originalText = document.getElementById("originalText").getModel().getText();

  editor.insertText((toLowerCase ? originalText.toLowerCase() : originalText.toUpperCase()));
}

/*
 * Event handler for the replace button.
 *
 * This button allows a user to perform a replace all operation only on the text
 * that has been selected by the user.
 */
function replaceBtnEHandler(event, _this) {
  var editor = atom.workspace.getActiveTextEditor();

  var originalText = document.getElementById("originalText").getModel().getText(); // the long text
  // containing that that is to be replaced
  var filterText = document.getElementById("filterText").getModel().getText(); // this is to be replaced
  var replaceText = document.getElementById("replaceText").getModel().getText(); // with this

  // if filterText contains a "?", then we do an advanced replace
  if(filterText.includes("?")){
    if(advancedReplace(editor, originalText, filterText, replaceText))
      return;
  }

  // search through originalText for filterText and replace those instances with replaceText
  // var replacedText = originalText.replace(new RegExp(filterText, "g"), replaceText);

  // A different replace-all solution as the above solution gave an error on replace "[0]" with "[1]"
  var replacedText = originalText.split(filterText).join(replaceText);

  editor.insertText(replacedText);
}

/*
 * Advanced text replace, that replaces text that matches an expression with a questionmark in it.
 * NOTE: ASSUMES THAT THERE IS ONLY ONE QUESTIONMARK IN THE FILTER TEXT
 * ALSO ASSUMES THAT THERE IS SOMETHING BEFORE AND AFTER THE QUESTIONMARK
 * THE CURRENT SOLUTION ALSO DEPENDS ON IDEAL BEFORE/AFTER FOR
 * FILTERING AS "[[0]" COULD FUCK THINGS UP...
 */
function advancedReplace(editor, originalText, filterText, replaceText) {
  var replacedText = "";

  // split the filter text on "?"
  var questionSplitted = filterText.split("?");
  if(questionSplitted.length != 2){
    return false;
  }
  var allSplit = [];
  var startPos = 2; // ugly hack to fix a bug in the simplest way

  var beforeSplit = originalText.split(questionSplitted[0]); // split on what comes before "?"
  for(var i = 0; i < beforeSplit.length; i++){
    if(beforeSplit[i] == ""){
      startPos = 0;
      continue;
    }
    afterSplit = beforeSplit[i].split(questionSplitted[1]);
    if(afterSplit[0] != ""){
      allSplit.push(afterSplit[0]);
    }
    if(afterSplit[1] != ""){
      allSplit.push(afterSplit[1]);
    }
  }

  // replace and slap before/after around whatever is in
  // positions i % 2 == 0
  for(var i = startPos; i < allSplit.length; i++){
    if((i % 2) == 0){
      allSplit[i] = questionSplitted[0] + replaceText + questionSplitted[1];
    }
  }

  replacedText = allSplit.join("");

  editor.insertText(replacedText);
  return true;
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
 * Returns the level the index content (bia[1]) is at. The level here means how deep an entry is
 *  burried inside brackets. E.g. the "1" in x[1] would be level 1, while x[y[1]] would be level 2 etc.
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

  return orgStr.substring(0, index) + replaceWith + orgStr.substring(index+replaceLen, orgStr.length);
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
}
