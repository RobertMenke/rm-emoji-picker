

"use strict";

export default class EmojiEditor {

    /**
     *
     * @param {HTMLElement|HTMLTextAreaElement|HTMLInputElement} input
     */
    constructor(input){
        /**
         *
         * @type {HTMLElement|HTMLTextAreaElement|HTMLInputElement}
         * @private
         */
        this._input = input;

        /**
         * @type {Boolean}
         * @private
         */
        this._is_content_editable = input.isContentEditable;
    }

    placeEmoji(emoji){

    }
}