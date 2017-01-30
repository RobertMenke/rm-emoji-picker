import $ from "jquery";
import EmojiEditor from "./EmojiEditor";
import EmojiCategory from "./EmojiCategory";
import Tooltip from "rm-tooltip";
import emojis from "./data";
import defaults from "./defaults";
import picker from "./../views/picker.mustache";

"use strict";

export default class EmojiPicker {


    /**
     *
     * @param {undefined|Object} options
     */
    constructor(options = undefined){

        this._callback = undefined;

        if(typeof options === "object"){
            this._setDefaults(options);
        }

        if(typeof options === "function"){
            this._callback = options;
        }

        /**
         * A copy of the defaults object so that state is not
         * mutated with new instances.
         *
         * @type {*}
         */
        this.defaults   = Object.assign({}, defaults);

        /**
         *
         * @type {Array.<EmojiCategory>}
         */
        this.categories = this._getCategories();

        /**
         * @type {jQuery}
         */
        this.$picker    = this._getPicker();

        /**
         *
         * @type {HTMLElement|undefined}
         * @private
         */
        this._icon      = undefined;

        /**
         *
         * @type {HTMLElement|undefined}
         * @private
         */
        this._container = undefined;

        /**
         *
         * @type {HTMLInputElement|HTMLTextAreaElement|HTMLElement|undefined}
         * @private
         */
        this._input     = undefined;

        /**
         * Keeps track of placing the emoji in the input, getting
         * the contents of the editor
         *
         * @type {EmojiEditor|undefined}
         */
        this.editor    = undefined;


        let _open = false;
        Object.defineProperty(this, 'picker_open', {
            get : () => _open,
            set : value => {
                if(value !== _open){
                    _open = value;
                    if(_open){
                        this.openPicker();
                    }
                    else{
                        this.$picker.detach();
                    }
                }
            }
        })
    }

    /**
     *
     * @param {HTMLElement} icon
     * @param {HTMLElement} container
     * @param {HTMLTextAreaElement|HTMLElement} input
     */
    listenOn(icon, container, input){
        this._removeOldEvents();
        this._icon                = icon;
        this._container           = container;
        this._input               = input;
        this.editor               = new EmojiEditor(input);

        this._onIconClick();
    }

    /**
     * Appends the emoji picker to the DOM
     *
     * @returns {EmojiPicker}
     */
    openPicker() {
        console.log("stuff", this._icon, this._container, this.$picker);
        const tooltip = new Tooltip(this._icon, this._container, this.$picker);
        switch(this.defaults.positioning){
            case "autoplace":
                tooltip.autoPlace(30, 10);
                break;
            case "vertical":
                tooltip.autoPlaceVertically(10);
                break;
            case "horizontal":
                tooltip.autoPlaceHorizontally(10);
                break;
            default:
                tooltip.autoPlace(30, 10);
                break;
        }

        this._onTooltipClick(tooltip, event);

        return this;
    }

    getText () {
        if(this.editor){
            return this.editor.getText();
        }

        throw new Error("Did you call this listenOn method first? The listenOn method constructs an instance of EmojiEditor and it appears to be undefined.");
    }

    /**
     * Find an emoji category by name.
     *
     * @param name
     * @returns {EmojiCategory}
     */
    getCategory(name){
        return this.categories.find(cat => cat.title === name);
    }

    /**
     * Finds an individual emoji by name. If the category is known
     * it can be supplied as the second arguent to speed up the search.
     *
     * @param {String} name
     * @param {EmojiCategory} category
     * @returns {*}
     */
    getEmoji(name, category = undefined){
        if(category){
            return category.emojis.find(emote => emote.full_name === name);
        }

        return this.categories.find(cat =>
            cat.emojis.find(emote => emote.full_name === name)
        );
    }

    /**
     * Sets default options based on developer-supplied parameters
     *
     * @param options
     * @private
     */
    _setDefaults(options){
        const keys = Object.keys(options);
        keys.forEach(key => {
            if(this.defaults.hasOwnProperty(key)){
                this.defaults[key] = options[key];
            }
        });
    }

    /**
     * When an emoji gets clicked on the selection bubbles up
     * to the EmojiPicker object. First, we place the emoji in
     * the input and then fire off any callback that were supplied.
     *
     *
     * @param {Emoji} emoji
     * @param {EmojiCategory} category
     * @private
     */
    _handleSelection(emoji, category){

        this.editor.placeEmoji(emoji);

        if(typeof this._callback === "function"){
            this._callback.bind(this)(emoji, category);
        }

        if(typeof this.defaults.callback === "function"){
            this.defaults.callback.bind(this)(emoji, category);
        }

        //Close the picker
        this.picker_open = false;
    }

    /**
     *
     * @returns {Array<EmojiCategory>}
     * @private
     */
    _getCategories() {
        return this.defaults
                   .categories
                   .map(cat => EmojiCategory.factory(cat, emojis[cat.title], this._handleSelection.bind(this)));
    }

    /**
     * Retrieves the emoji picker
     *
     * @returns {jQuery|HTMLElement}
     * @private
     */
    _getPicker() {
        const $picker = $(picker({
            default_content: defaults.default_content,
            categories     : this.categories.map(cat => cat.exportContents())
        }));

        const $contents = $picker.find('.emoji-content');

        this.categories.forEach(cat => {
            $contents.append(cat.getMarkup());
        });

        return $picker;
    }

    /**
     * Removes any old click handlers on the icon.
     *
     * @returns {EmojiPicker}
     * @private
     */
    _removeOldEvents (){
        if(this._icon){
            $(this._icon).off('click.emoji-picker');
        }

        return this;
    }

    /**
     * Toggle the visibility of the picker when the icon
     * gets clicked.
     *
     * @returns {EmojiPicker}
     * @private
     */
    _onIconClick() {

        $(this._icon).off('click.emoji').on('click.emoji', event => {
            this.picker_open = !this.picker_open;
        });

        return this;
    }

    /**
     *
     * @param {Tooltip} tooltip
     * @param {Event} event
     * @private
     */
    _onTooltipClick(tooltip, event){
        tooltip.setClickCallback(event, (target, $tooltip) => {
            const $picker = $(target).closest('#emoji-picker');
            const is_icon = $(target).is(this._icon);

            //If the click occurred outside of the tooltip
            if(!$picker.length && !is_icon){
                this.picker_open = false;
            }
        });
    }
}