import Converters from "./Converters";
import $ from "jquery";
import defaults from "./defaults";
import "./polyfills";

export default class Emoji {

    static factory(data, category, callback){
        const emoji = new Emoji(data, category);
        emoji.setCallback(callback);
        return emoji;
    }

    static get random_color (){
        const colors = ["blue", "yellow", "green", "orange", "indigo", "pink"];
        return colors[Emoji.randomIntFromInterval(0, colors.length - 1)];
    }

    /**
     * @link http://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
     * @param min
     * @param max
     * @returns {number}
     */
    static randomIntFromInterval(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    constructor(data, category){

        /**
         * @type {Boolean}
         */
        this.has_apple_img    = data['has_img_apple'];

        /**
         * @type {Boolean}
         */
        this.has_google_img   = data['has_img_google'];

        /**
         * @type {Boolean}
         */
        this.has_twitter_img  = data['has_img_twitter'];

        /**
         * @type {Boolean}
         */
        this.has_emojione_img = data['has_img_emojione'];

        /**
         * @type {String} - the name of the category
         */
        this.category         = category;

        /**
         * @type {String}
         */
        this.full_name        = data['name'];

        /**
         * @type {String}
         */
        this.short_name       = data['short_name'];

        /**
         * @type {String[]}
         */
        this.short_names      = data['short_names'];

        /**
         * @type {Number}
         */
        this.sort_order       = data['sort_order'];

        /**
         * @type {String}
         */
        this.hover_color      = Emoji.random_color;

        /**
         * Gets the emoji for the
         * @type {string}
         */
        this.$emoji           = this.getEmojiForPlatform();

        /**
         * Callback executed when the emoji was clicked
         *
         * @type {Function|undefined}
         * @private
         */
        this._bubble        = undefined;
        //Set a click listener on the emoji
        this._onClick()
            ._onHover();
    }

    /**
     * Getter for the emoji's colon syntax
     *
     * @returns {string}
     */
    getColons () {
        return `:${this.short_name}:`;
    }

    /**
     * Getter for the unicode emoji
     *
     * @returns {string}
     */
    getUnified () {
        return Converters.withUnified().replace_colons(this.getColons());
    }

    /**
     * Gets the image representation of an emoji
     *
     * @returns {string}
     */
    getImage () {
        return Converters.withImage().replace_colons(this.getColons());
    }

    /**
     * @return {String} Codepoints for the emoji
     */
    getCodepoints (){
        const $image = $(this.getImage());
        if($image.hasClass('emoji-inner')){
            return $image.data('codepoints');
        }

        return $image.find('.emoji-inner').data('codepoints');
    }

    /**
     * Getter for the emoji character regardless of the platform.
     *
     * @returns {string}
     */
    getCharacter() {
        const codepoints = this.getCodepoints();
        if(/-/g.test(codepoints)){
            const arr = codepoints.split("-").map(str => `0x${str}`);
            return String.fromCodePoint(...arr);
        }
        return String.fromCodePoint(`0x${codepoints}`);
    }

    /**
     * Determines if the environment supports unified unicode.
     *
     * @returns {boolean}
     */
    static supportsUnified (){
        return Converters.withEnvironment().replace_mode === "unified";
    }

    /**
     * Gets the platform-appropriate representation of the emoji.
     *
     * @return {string|jQuery}
     */
    getEmojiForPlatform(){

        const emote = Converters.withEnvironment()
                                .replace_colons(this.getColons());

        return this._getWrapper().append(emote);
    }

    /**
     *
     * @returns {*}
     */
    getPreview(){
        const emote = Converters.withEnvironment()
                                .replace_colons(this.getColons());

        return this._getPreviewWrapper().append(emote);
    }

    /**
     * Getter for the class' markup
     *
     * @returns {string}
     */
    getMarkup() {
        return this.$emoji;
    }

    /**
     * Gets the html of an emoji for things like pasting
     * raw html into the contenteditable.
     *
     * @return {String}
     */
    getHtml() {
        return this.$emoji.get(0).innerHTML;
    }

    /**
     * Sets the callback that gets executed when the emoji gets clicked
     *
     * @param {Function} callback
     * @returns {Emoji}
     */
    setCallback(callback){
        this._bubble = callback;
        return this;
    }

    /**
     *
     * @param regexp
     * @returns {undefined|String}
     */
    matchesSearchTerm(regexp){
        return this.short_names.find(name => regexp.test(name));
    }

    /**
     * Gets the wrapper for the emoji
     *
     * @returns {jQuery|HTMLElement}
     * @private
     */
    _getWrapper(){
        return $(`<span class = "emoji-char-wrapper ${this.hover_color}" data-name="${this.full_name}" data-category="${this.category}"></span>`);
    }

    /**
     * Gets the wrapper for the preview
     *
     * @returns {jQuery|HTMLElement}
     * @private
     */
    _getPreviewWrapper(){
        return $(`<span class = "emoji-preview-wrapper ${this.hover_color}" data-name="${this.full_name}" data-category="${this.category}"></span>`);
    }

    /**
     *
     * @returns {Emoji}
     * @private
     */
    _onClick(){
        $(this.$emoji).off('click.emoji').on('click.emoji', event => {
            if(this._bubble){
                this._bubble(defaults.events.SELECTED, this);
            }
        });

        return this;
    }

    /**
     *
     * @returns {Emoji}
     * @private
     */
    _onHover () {
        $(this.$emoji).off('mouseenter.emoji').on('mouseenter.emoji', () => {
            this._bubble(defaults.events.EMOJI_MOUSEENTER, this);
        }).off('mouseleave.emoji').on('mouseleave.emoji', () => {
            this._bubble(defaults.events.EMOJI_MOUSELEAVE, this);
        });

        return this;
    }
}
