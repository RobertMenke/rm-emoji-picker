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
         * @type {jQuery}
         */
        this.$active_title = this.$picker.find('#active-title');

        /**
         * @type {jQuery}
         */
        this.$preview_emoji = this.$picker.find('#emoji-large-preview');

        /**
         * @type {jQuery}
         */
        this.$preview_name  = this.$picker.find('#emoji-name');

        /**
         * @type {jQuery}
         */
        this.$preview_colon = this.$picker.find('#colon-display');

        /**
         * @type {jQuery}
         */
        this.$content      = this.$picker.find('.emoji-content');

        /**
         * @type {jQuery}
         */
        this.$default_footer = this.$picker.find('.default-content');

        /**
         * @type {jQuery}
         */
        this.$preview        = this.$picker.find('.emoji-preview');

        /**
         * @type {jQuery}
         */
        this.$search         = this.$picker.find('.search-emojis');

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
        });

        let _active_cat;
        Object.defineProperty(this, 'active_category', {
            get : () => _active_cat,
            set : value => {
                if(!_active_cat || (value instanceof EmojiCategory && value.title !== _active_cat.title)){
                    _active_cat = value;
                    this.setActiveCategory();
                }
            }
        });

        let _emoji;
        Object.defineProperty(this, 'active_emoji', {
           get : () => _emoji,
            set : value => {
               if(!_emoji || !value || (value.full_name !== _emoji.full_name)){
                   _emoji = value;
                   this._updatePreview();
               }
            }
        });


        this.active_category = this.categories[0];

        this._onScroll()
            ._onCatClick()
            ._onSearch();
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
        this.$content.get(0).scrollTop = this.active_category.offset_top;

        return this;
    }

    getText () {
        if(this.editor){
            return this.editor.getText();
        }

        throw new Error("Did you call this listenOn method first? The listenOn method constructs an instance of EmojiEditor and it appears to be undefined.");
    }

    /**
     * Updates the dom based on the category that became active.
     *
     * @returns {EmojiPicker}
     */
    setActiveCategory () {

        const picker = this;
        this.$picker.find('.select-category').each(/**@this {HTMLElement}*/function(){
            const title = this.getAttribute('data-name');
            if(title === picker.active_category.title){
                this.classList.add('active');
                picker.$active_title.text(picker.active_category.title);
            }
            else{
                this.classList.remove('active');
            }
        });

        return this;
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

    _dispatchBubble(action, emoji, category){

        const events = defaults.events;
        switch(action){
            case events.SELECTED:
                this._handleSelection(emoji, category);
                break;
            case events.EMOJI_MOUSEENTER:
                this.active_emoji = emoji;
                break;
            case events.EMOJI_MOUSELEAVE:
                this.active_emoji = undefined;
                break;
            default:
                break;
        }
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
            this._callback(emoji, category);
        }

        if(typeof this.defaults.callback === "function"){
            this.defaults.callback(emoji, category);
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
        const cats = this.defaults
                         .categories
                         .map(cat => EmojiCategory.factory(cat, emojis[cat.title], this._dispatchBubble.bind(this)));

        cats[0].$category.addClass('first');
        return cats;
    }

    /**
     * Retrieves the emoji picker
     *
     * @returns {jQuery|HTMLElement}
     * @private
     */
    _getPicker() {
        const $picker = $(picker({
            default_content: defaults.default_footer_message,
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

    /**
     *
     * @returns {EmojiPicker}
     * @private
     */
    _onScroll(){
        this.$content.off('mousewheel.emoji').on('mousewheel.emoji', event => {
            this.active_category = this._getActiveCategory();
        });

        return this;
    }

    _onCatClick() {

        const picker = this;
        this.$picker.find('.select-category').off('click.emoji').on('click.emoji', /**@this {HTMLElement}*/function(){
            const cat                        = picker.getCategory(this.getAttribute('data-name'));
            picker.$content.get(0).scrollTop = cat.offset_top;
            picker.active_category           = picker._getActiveCategory();
        });

        return this;
    }

    /**
     *
     *
     * @returns {EmojiPicker}
     * @private
     */
    _onSearch() {
        this.$search.off('input.emoji').on('input.emoji', () => {
            const search = this.$search.val().trim();
            this.categories.forEach(cat => cat.search_term = search);
            this.$active_title.text(`Results for: ${search}`);
            if(search.length === 0){
                this.active_category = this._getActiveCategory();
                //Manually call this in case the category hadn't changed since the search started
                this.setActiveCategory();
            }
        });

        return this;
    }

    /**
     * Gets the active category based on scroll position
     *
     * @returns {EmojiCategory}
     * @private
     */
    _getActiveCategory() {

        const scroll_top = this.$content.get(0).scrollTop;
        let cat          = this.categories[0];

        for(let i = 0; i < this.categories.length; i++){
            if(this.categories[i].offset_top > scroll_top){
                return cat;
            }
            cat = this.categories[i];
        }

        return this.categories[this.categories.length - 1];
    }

    /**
     * Updates the preview section with either the default content
     * or
     *
     * @private
     */
    _updatePreview(){

        const emoji = this.active_emoji;
        if(emoji){
            this.$default_footer.hide();
            this.$preview_emoji.html(emoji.getPreview());
            this.$preview_name.text(emoji.short_name);
            if(defaults.show_colon_preview){
                this.$preview_colon.text(emoji.getColons());
            }
            this.$preview.show();
        }
        else{
            this.$preview.hide();
            this.$default_footer.show();
        }
    }
}