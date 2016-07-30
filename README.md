# ATOM-TEXT-REPLACE package

A simple plugin for atom. It's used for simplifying some recurring operations while programming.

## The two buttons
###INDEX
This button automatically updates the indices of a variable.

For example if we want to do something for a couple of entries of a variable in such as:
parseFloat(x[0]) + parseFloat(x[1]) + parseFloat(x[2])

then we can just use
parseFloat(x[0]) + parseFloat(x[0]) + parseFloat(x[0])


and then mark the specific text and open the text-replace dialog and press the index button to
have the indices automatically be updated in an incremental manner to achieve
parseFloat(x[0]) + parseFloat(x[1]) + parseFloat(x[2])

### REPLACE
This button performs a find and replace operation, but only on the text that has been selected.


![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)
