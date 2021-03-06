'use babel';

import TextReplaceView from './text-replace-view';
import { CompositeDisposable } from 'atom';

export default {

  textReplaceView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.textReplaceView = new TextReplaceView(state.textReplaceViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.textReplaceView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'text-replace:toggle': () => this.toggle()
    }));

    // Register command (esc) that closes this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'core:close': () => this.closeHide(),
      'core:cancel': () => this.closeHide()
    }));

    // Register commands (enter) for replace action on click
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'core:confirm': (event) => this.replaceAction(event),
      'text-replace:confirm': () => this.replaceAction()
    }));
    // enter? == core:confirm and 'text-replace:confirm'

    // Register commands (tab) for easier navigation
    // TODO: FIX HERE AS IT DOES NOT WORK
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'core:focus-next': () => this.tabAction(),
      'text-replace:focus-next': () => this.tabAction()
    }));
    // 'text-replace:focus-next' == tab?
  },

  deactivate() {
    console.log("deactivated");
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.textReplaceView.destroy();
  },

  serialize() {
    return {
      textReplaceViewState: this.textReplaceView.serialize()
    };
  },

  toggle() {
    console.log('TextReplace was toggled!');
    var editor = atom.workspace.getActiveTextEditor()
    // editor.insertText("NEW FUCKING TEXT")
    var selectedText = editor.getSelectedText()
    // editor.insertText(selectedText)
    // this.textReplaceView.openedTimes += 1;
    // increaseOpenedTimes(this.textReplaceView);
    var replaceTextArea = document.getElementById("originalText");
    var replaceTextAreaModel = replaceTextArea.getModel();
    replaceTextAreaModel.setText(selectedText);
    // replaceTextArea.innerHTML = selectedText;
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  closeHide() {
    this.modalPanel.hide()
  },

  replaceAction(event){
    if(event.target.id != "filterText" &&
      event.target.id != "replaceText"){
        return; // ugly hack to prevent this action from
        // being triggered by events executed in other
        // windows.
    }
    console.log("replacing action activated");
    document.getElementById("replaceButton1").click();
    this.closeHide();
    event.stopPropagation(); // stop the event propagation
    // console.log("EVENT: ");
    // console.log(event);
  },

  tabAction(){
    // find the focused element and move to the next
    console.log("tab action activated");
  }



};

function increaseOpenedTimes(textReplaceView){
  textReplaceView.openedTimes += 1;
}
