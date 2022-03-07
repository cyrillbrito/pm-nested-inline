import './style.css';
// import 'prosemirror-view/style/prosemirror.css'

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { menuBar, MenuItem } from "prosemirror-menu";


// Define our schema
const ourSchema = new Schema({
  nodes: {
    doc: {
      content: '(nested|text)*',
    },
    nested: {
      content: 'text*',
      parseDOM: [{ tag: 'span' }],
      toDOM() { return ['span', 0] },
      inline: true,
    },
    text: {},
  }
});

// Define our plugins
const ourPlugins = [
  menuBar({
    content: [[new MenuItem({
      icon: { width: 24, height: 24, path: "M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" },
      run(state, dispatch, view) {
        const slice = state.tr.selection.content();
        const node = ourSchema.nodes.nested.create(null, slice.content);
        dispatch(state.tr.replaceSelectionWith(node));
      }
    })]],
  })
];


const editorEl = document.querySelector("#editor");
const contentEl = document.querySelector("#content");

new EditorView(editorEl, {
  state: EditorState.create({
    doc: DOMParser.fromSchema(ourSchema).parse(contentEl),
    plugins: ourPlugins,
  })
});


