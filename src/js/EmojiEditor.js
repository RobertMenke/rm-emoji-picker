"use strict"
import {
    selectElementContents,
    pasteHtmlAtCaret,
    saveSelection,
    selectElement,
    pasteTextAtCaret,
    dispatchEvents,
    restoreSelection,
    parseStringCodepoints,
    isContentEditable,
    pasteHTMLElementAtCaret
} from "./utils"
import Emoji from "./Emoji"


export default class EmojiEditor {

    /**
     *
     * @param {HTMLElement|HTMLTextAreaElement|HTMLInputElement} input
     * @param {Converters} converters
     * @param {Boolean} prevent_new_line
     */
    constructor(input, converters, prevent_new_line = false){
        /**
         *
         * @type {HTMLElement|HTMLTextAreaElement|HTMLInputElement}
         * @private
         */
        this._input = input

        /**
         * @type {Boolean}
         * @private
         */
        this._is_content_editable = isContentEditable(input)

        this.converters = converters

        /**
         *
         * @type {Range|undefined}
         */
        this.cursor_position = undefined

        /**
         *
         * @type {boolean}
         */
        this.prevent_new_line = prevent_new_line

        this._trackCursor()
        this._onPaste()
    }

    /**
     * Pastes an emoji at the caret.
     *
     * @param {Emoji} emoji
     */
    placeEmoji(emoji : Emoji) {
        this._input.focus()
        if(this.cursor_position){
            restoreSelection(this.cursor_position)
        }

        if(this._is_content_editable){
            return this.placeContentEditableEmoji(emoji)
        }

        const text = this.pasteInputText(emoji.getColons())
        dispatchEvents(this._input, ['change', 'input'])
        return text
    }

    placeContentEditableEmoji (emoji : Emoji) {
        const node = emoji.getEditableFragment().firstElementChild
        const spacer   = document.createTextNode("\u200B")
        pasteHTMLElementAtCaret(node)
        pasteHTMLElementAtCaret(spacer)
        this.cursor_position = saveSelection()
        dispatchEvents(this._input, ['change', 'input'])
        return node
    }


    /**
     * Pastes text at the cursor while preserving cursor position.
     *
     * @param text
     * @return {String}
     */
    pasteInputText(text : string){

        const cursor_position = this._input.selectionStart
        const current_length  = this._input.value.length
        this._input.value     = this._input.value.substr(0, cursor_position)
                                + text
                                + this._input.value.substr(cursor_position)

        this.setInputCaretPosition(cursor_position + this._input.value.length - current_length)

        return text
    }

    /**
     * Sets the caret position on a textarea or input[type=text] field
     *
     *
     * @param position
     * @returns {boolean}
     */
    setInputCaretPosition(position){
        if(this._input.createTextRange){
            const range = this._input.createTextRange()
            range.move('character', position)
            range.select()
            return true
        }
        else {
            if(this._input.selectionStart || this._input.selectionStart === 0){
                this._input.focus()
                this._input.setSelectionRange(position, position)
                return true
            }
            //Otherwise this method failed (browser not supported)
            else{
                this._input.focus()
                return false
            }
        }
    }

    /**
     * Gets the text from the input
     *
     * @returns {*}
     */
    getText() {
        if(this._is_content_editable){
            return mapElement(this._input).replace(/[\u200B-\u200D\uFEFF]/g, '')
        }

        return this.converters.unicode.replace_colons(this._input.value)
    }

    /**
     * Empty the input's contents.
     */
    empty () {
        if(this._is_content_editable){
            this._input.innerHTML = ""
        }
        else{
            this._input.value = ""
        }
    }
    /**
     * Intercepts paste events for contenteditable divs so that we don't get
     * any of the special html that gets inserted automatically.
     *
     * @returns {EmojiEditor}
     * @private
     */
    _onPaste(){
        if(this._is_content_editable){
            this._input.addEventListener('paste', (event) => {
                event.stopPropagation()
                event.preventDefault()

                const clipboard_data = event.clipboardData || window.clipboardData
                const pasted_data    = clipboard_data.getData('text')
                const text           = pasteTextAtCaret(pasted_data)
                selectElement(text)
            })
        }

        return this
    }

    /**
     * Get all of the child nodes in an input
     *
     * @returns {Array<Node>}
     */
    getNodes () {
        return Array.prototype.slice.call(this._input.childNodes)
    }

    /**
     * Selects the last node in the input.
     */
    selectLastNode(){
        const nodes = this.getNodes()
        if(nodes.length){
            selectElement(nodes[nodes.length - 1])
            this.cursor_position = saveSelection()
        }
    }

    /**
     * Tracks the cursor position and monitors the enter button in case prevent_new_line is true
     *
     * @returns {EmojiEditor}
     * @private
     */
    _trackCursor(){
        if(this._is_content_editable){
            this._input.addEventListener('keyup', () => this.cursor_position = saveSelection())

            this._input.addEventListener('keydown', (event : KeyboardEvent) => {
                if(event.key === "Enter" && this.prevent_new_line){
                    event.preventDefault()
                }
            })
        }

        return this
    }


    /**
     * Replaces unified unicode inside of a contenteditable element with
     * platform appropriate content.
     *
     */
    replaceUnified () {
        if(this._is_content_editable){
            const html = this.converters.image.replace_unified(this._input.innerHTML)
            selectElementContents(this._input)
            const node = EmojiEditor.pasteHtml(html)
            if(node){
                selectElement(node)
            }
        }
        else{
            throw new Error("The replaceUnified method should only be called on contenteditable elements.")
        }

    }

    /**
     * Shortcut to paste html at the caret with a dummy unicode character.
     *
     * @param html
     */
    static pasteHtml(html){
        return pasteHtmlAtCaret(html + "&#8203")
    }
}

/**
 * Extracts the text content from a contenteditable and extracts any spans.
 *
 * @param span
 * @returns {String}
 * @private
 */
const extractEmojiFromSpan = (span : HTMLSpanElement) => {
    const inner = span.querySelector('.emoji-inner')
    //If the span was not inserted by the emoji picker
    if(!inner){
        const text = inner.textContent
        return text || ""
    }
    //If the span was inserted by the emoji picker, get the codepoints and return the corresponding character
    try {
        const codepoint = inner.getAttribute('data-codepoints')
        return parseStringCodepoints(codepoint)
    }
    catch (err){
        return ""
    }
}

/**
 * Extracts codepoints from an image if it exists.
 *
 * @param {HTMLElement} img
 * @private
 */
const extractEmojiFromImage = (img : HTMLImageElement) => {
    if(img.hasAttribute('data-codepoints')){
        return parseStringCodepoints(
            img.getAttribute('data-codepoints')
        )
    }

    return ""
}

/**
 * Extracts just text and emojis from a contenteditable element
 *
 * @param {HTMLElement} el
 */
const mapElement = (el : HTMLElement) : string => {

    const children = Array.from(el.childNodes)

    return children.map((node : Text|HTMLElement) : Array<String> => {

        const is_text = node instanceof Text
        const is_html = node instanceof HTMLElement

        //Return all text from text nodes
        if(is_text){
            return node.textContent
        }
        //Extract codepoints from span
        if(is_html && node.tagName === "SPAN"){
            return extractEmojiFromSpan(node)
        }
        //Extract codepoints from an image if it was supplied
        if(is_html && node.tagName === "IMG"){
            return extractEmojiFromImage(node)
        }
        //Convert br tags to line breaks
        if(is_html && node.tagName === "BR"){
            return "\n"
        }
        //if the element is not html we're accounting for run it back through this function
        if(is_html){
            return mapElement(node)
        }
        //Unaccounted for situation - just return a blank string
        return ""
    }).join("")
}