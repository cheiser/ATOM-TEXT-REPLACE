# ATOM-TEXT-REPLACE package
-----------------------------------------
<!-- TODO:
Initial focus on filter box and tab support.

-----------------------------------
display the number of matches for filter (as the user is entering each letter, i.e.
a onChange event triggers a function which displays the current number of matches)
---------------------------------------------

bug with
h, s, v = colorsys.rgb_to_hsv(frame[y][x][0], frame[y][x][0], frame[y][x][0])
and [splitted[2], splitted[2], splitted[2]]

regex replace: \reg \reg
-->

-----------------------------------------
A simple plugin for atom written in JavaScript (not CoffeeScript). It's used for simplifying some recurring operations while programming.

## The four buttons
###INDEX
This button automatically updates the indices of a variable.

For example if we want to do something for a couple of entries of a variable in such as:

```
parseFloat(x[0]) + parseFloat(x[1]) + parseFloat(x[2])
```

then we can just use

```
parseFloat(x[0]) + parseFloat(x[0]) + parseFloat(x[0])
```

and then mark the specific text and open the text-replace dialog and press the index button to
have the indices automatically be updated in an incremental manner to achieve

```
parseFloat(x[0]) + parseFloat(x[1]) + parseFloat(x[2])
```

### REPLACE
This button performs a find and replace operation, but only on the text that has been selected.

For example if we have the following text:

```
This is but a test

Yes a test

Nice test!
```

and we then mark the second row (Yes a test) and open the dialog and enter under the filter text box "test" and under the replace text box "changed", we end up with:

```
This is but a test

Yes a changed

Nice test!
```

#### Regex replace
This button also has support for a regular expression find and replace.

For example

original text:

```
a[0]
b[0]
c[0]
```

filter:

```
/\w\[0\]/
```

and replace text:

```
k
```

results in:

```
k[0]
k[0]
k[0]
```

#### Advanced Regex replace
It is possible to utilize that which is to be replaced to determine what is to be replacing it.

The way to refer back to the replaced text is through \reg.
 <!-- and it is also possible to refer to other text that is replaced using \reg\{X\}, where "X" is the absolute index position of the replaced text. -->

Example:

```
k[0]
k[0]
k[0]
```

filter:
```
/k/
```

replace:
```
\regs
```

Result:
```
ks[0]
ks[0]
ks[0]
```

### LowerCase
This button converts the selected text to lower case.

```
This is but a test
```

Becomes

```
this is but a test
```

### UpperCase
This button converts the selected text to upper case.

```
This is but a test
```

Becomes

```
THIS IS BUT A TEST
```

## Installation
1. git clone the package repo into ~/.atom/packages

2. cd into the package directory

3. type npm install

4. restart atom

![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)
