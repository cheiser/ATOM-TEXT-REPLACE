'use babel';

import TextReplace from '../lib/text-replace';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('TextReplace', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('text-replace');
  });

  describe('when the text-replace:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.text-replace')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'text-replace:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.text-replace')).toExist();

        let textReplaceElement = workspaceElement.querySelector('.text-replace');
        expect(textReplaceElement).toExist();

        let textReplacePanel = atom.workspace.panelForItem(textReplaceElement);
        expect(textReplacePanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'text-replace:toggle');
        expect(textReplacePanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.text-replace')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'text-replace:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let textReplaceElement = workspaceElement.querySelector('.text-replace');
        expect(textReplaceElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'text-replace:toggle');
        expect(textReplaceElement).not.toBeVisible();
      });
    });
  });
});
