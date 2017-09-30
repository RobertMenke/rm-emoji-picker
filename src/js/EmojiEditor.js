"use strict"
import $ from "jquery"
import Converters from "./Converters"
import {
    selectElementContents,
    pasteHtmlAtCaret,
    saveSelection,
    selectElement,
    pasteTextAtCaret,
    dispatchEvents,
    restoreSelection,
    parseCodepoints,
    isContentEditable
} from "./utils"


export default class EmojiEditor {

    /**
     *
     * @param {HTMLElement|HTMLTextAreaElement|HTMLInputElement} input
     * @param {Boolean} prevent_new_line
     */
    constructor(input, prevent_new_line = false){
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
     * Pastes an emoji at the caret taking into account whether the element
     * is contenteditable or not.
     *
     * @param {Emoji} emoji
     */
    placeEmoji(emoji){
        this._input.focus()
        if(this.cursor_position){
            restoreSelection(this.cursor_position)
        }

        if(this._is_content_editable){
            let node
            if(EmojiEditor.supportsUnified()){
                node = pasteTextAtCaret(emoji.getCharacter())
                selectElement(node)
                this.cursor_position = saveSelection()
            }
            else {
                node = EmojiEditor.pasteHtml(emoji.getHtml())
                this.cursor_position = saveSelection()
            }

            $(this._input).trigger('change').trigger('input')

            return node
        }

        const text = this.pasteInputText(emoji.getColons())
        dispatchEvents(this._input, ['change', 'input'])
        return text
    }


    /**
     * Pastes text at the cursor while preserving cursor position.
     *
     * @param text
     * @return {String}
     */
    pasteInputText(text){

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
            return this._mapElement(this._input)
                       .replace(/[\u200B-\u200D\uFEFF]/g, '')
        }

        return Converters.withUnified().replace_colons(this._input.value)
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
            $(this._input).off('paste.editable').on('paste.editable', event => {
                event.stopPropagation()
                event.preventDefault()

                const clipboard_data = event.originalEvent.clipboardData || window.clipboardData
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
     * Extracts just text and emojis from a contenteditable element
     *
     * @param {HTMLElement} el
     * @private
     */
    _mapElement(el){

        const children = Array.prototype.slice.call(el.childNodes)

        return children.map(/**Text|HTMLElement*/node => {

            const is_text = node instanceof Text
            const is_html = node instanceof HTMLElement

            //Return all text from text nodes
            if(is_text){
                return node.textContent
            }
            //Extract codepoints from span
            else if(is_html && node.tagName === "SPAN"){
                return EmojiEditor._extractSpan(node)
            }

            //Extract codepoints from an image if it was supplied
            else if(is_html && node.tagName === "IMG"){
                return EmojiEditor._extractImage(node)
            }

            //Convert br tags to line breaks
            else if(is_html && node.tagName === "BR"){
                return "\n"
            }

            //if the element is not html we're accounting for run it back through this function
            else if(is_html){
                return this._mapElement(node)
            }
            else {
                //Unaccounted for situation - just return a blank string
                return ""
            }
        }).join("")
    }

    /**
     * Tracks the cursor position and monitors the enter button in case prevent_new_line is true
     *
     * @returns {EmojiEditor}
     * @private
     */
    _trackCursor(){
        if(this._is_content_editable){
            $(this._input).off('keyup.emoji mouseup.emoji').on('keyup.emoji mouseup.emoji', () => {
                this.cursor_position = saveSelection()
            })

            $(this._input).off('keydown.emoji').on('keydown.emoji', event => {
                if(event.which === 13 && this.prevent_new_line){
                    event.preventDefault()
                }
            })
        }

        return this
    }
    /**
     * Extracts the text content from a contenteditable and extracts any spans.
     *
     * @param span
     * @returns {String}
     * @private
     */
    static _extractSpan(span){
        const $span = $(span)
        const $inner = $span.find('.emoji-inner')
        //If the span was not inserted by the emoji picker
        if(!$inner.length){
            return ""
        }
        //If the span was inserted by the emoji picker, get the codepoints and return the corresponding character
        try {
            const codepoint = $inner.data('codepoints')
            return parseCodepoints(codepoint)
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
    static _extractImage(img){
        if(img.hasAttribute('data-codepoints')){
            return parseCodepoints(
                img.getAttribute('data-codepoints')
            )
        }

        return ""
    }

    /**
     * Replaces unified unicode inside of a contenteditable element with
     * platform appropriate content.
     *
     */
    replaceUnified () {

        if(this._is_content_editable){
            const converter = Converters.withEnvironment()
            const html = converter.replace_unified(this._input.innerHTML)
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
     * Determines if the environment supports unified unicode.
     *
     * @returns {boolean}
     */
    static supportsUnified (){
        return Converters.withEnvironment().replace_mode === "unified"
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
