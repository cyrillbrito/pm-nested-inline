import './style.css'
// import 'prosemirror-view/style/prosemirror.css'

import { EditorState, Plugin, TextSelection, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema } from 'prosemirror-model'
import { keydownHandler } from 'prosemirror-keymap'

// Define our schema
const ourSchema = new Schema({
  nodes: {
    doc: { content: '(nested|text)*' },
    nested: {
      content: 'text*',
      inline: true,
      toDOM() {
        return [
          'nested',
          ['span', { contenteditable: false }],
          ['span', 0],
          ['span', { contenteditable: false }]
        ]
      }
    },
    text: {}
  }
})

// Define our plugins
const ourPlugins = [
  new Plugin({
    props: {
      handleKeyDown: keydownHandler({
        ArrowLeft: arrowLeftHandler,
        ArrowRight: arrowRightHandler
      })
    }
  })
]

        // 'Shift-ArrowRight': shiftArrowRightHandler,
        // 'Shift-ArrowLeft': shiftArrowLeftHandler

function arrowLeftHandler(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView): boolean {
  const $head = state.selection.$head
  const nextNode = $head.nodeBefore

  // Detect selection moving ↖
  if (nextNode?.type.name === 'nested') {
    setDomSelection(view, $head.pos - 1)
    return true
  }

  // Detect selection moving ↙
  if (!nextNode && $head.parent.type.name === 'nested') {
    setDomSelection(view, $head.pos - 1)
    return true
  }

  return false
}

function arrowRightHandler(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView): boolean {
  const $head = state.selection.$head
  const nextNode = $head.nodeAfter

  // Detect selection moving ↗
  if (nextNode?.type.name === 'nested') {
    setDomSelection(view, $head.pos + 1)
    return true
  }

  // Detect selection moving ↘
  if (!nextNode && $head.parent.type.name === 'nested') {
    setDomSelection(view, $head.pos + 1)
    return true
  }

  return false
}

function shiftArrowRightHandler(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView): boolean {
  const { $head, $anchor } = state.selection
  const nextNode = $head.nodeAfter

  // Detect nested to the ➡
  if (nextNode?.type.name === 'nested') {
    const sel = TextSelection.create(state.doc, $anchor.pos, $head.pos + nextNode.nodeSize)
    const tr = state.tr.setSelection(sel)
    dispatch(tr)
    return true
  }

  return false
}

function shiftArrowLeftHandler(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView): boolean {
  const { $head, $anchor } = state.selection
  const nextNode = $head.nodeBefore

  // Detect nested to the ⬅
  if (nextNode?.type.name === 'nested') {
    const sel = TextSelection.create(state.doc, $anchor.pos, $head.pos - nextNode.nodeSize)
    const tr = state.tr.setSelection(sel)
    dispatch(tr)
    return true
  }

  return false
}

function setDomSelection(view: EditorView, pos: number) {
  const { node, offset } = view.domAtPos(pos)

  const range = document.createRange()
  range.setStart(node, offset)

  const domSel = window.getSelection()
  domSel.removeAllRanges()
  domSel.addRange(range)
}

const editorEl = document.querySelector('#editor')

new EditorView(editorEl, {
  state: EditorState.create({
    doc: ourSchema.nodeFromJSON({
      type: 'doc',
      content: [
        { type: 'text', text: 'Right' },
        { type: 'nested', content: [{ type: 'text', text: 'nested' }] },
        { type: 'text', text: 'Left' }
      ]
    }),
    plugins: ourPlugins
  })
})
