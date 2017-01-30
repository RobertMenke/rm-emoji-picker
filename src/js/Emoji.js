import Converters from "./Converters";
import $ from "jquery";

export default class Emoji {

    static factory(data, category, callback){
        const emoji = new Emoji(data, category);
        emoji.setCallback(callback);
        return emoji;
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
         * @type {Number}
         */
        this.sort_order       = data['sort_order'];

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
        this._callback        = undefined;
        //Set a click listener on the emoji
        this._onClick();
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
        console.log("image", $image.get(0));
        return $image.data('codepoints');
    }

    /**
     * Getter for the emoji character regardless of the platform.
     *
     * @returns {string}
     */
    getCharacter() {
        return String.fromCodePoint(`0x${this.getCodepoints()}`);
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
     * Getter for the class' markup
     *
     * @returns {string}
     */
    getMarkup() {
        return this.$emoji;
    }

    /**
     * Sets the callback that gets executed when the emoji gets clicked
     *
     * @param {Function} callback
     * @returns {Emoji}
     */
    setCallback(callback){
        this._callback = callback;
        return this;
    }

    /**
     * Gets the wrapper for the emoji
     *
     * @returns {jQuery|HTMLElement}
     * @private
     */
    _getWrapper(){
        return $(`<span class = "emoji-char-wrapper" data-name="${this.full_name}" data-category="${this.category}"></span>`);
    }

    _onClick(){
        $(this.$emoji).off('click.emoji').on('click.emoji', event => {
            if(this._callback){
                this._callback(this);
            }
        });

        return this;
    }
}