import Converters from "./Converters";
import $ from "jquery";

export default class Emoji {

    constructor(data){

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
        const converter = Converters.factory();
        return converter.withUnified().replace_colons(this.getColons());
    }

    /**
     * Gets the image representation of an emoji
     *
     * @returns {string}
     */
    getImage () {
        const converter = Converters.factory();
        return converter.withImage().replace_colons(this.getColons());
    }

    /**
     * Gets the platform-appropriate representation of the emoji.
     *
     * @return {string|jQuery}
     */
    getEmojiForPlatform(){
        const converter = Converters.factory();
        const emote = converter.withEnvironment()
                                 .replace_colons(this.getColons());

        const $emote = $(emote);
        //If we get back html, just return it
        if($emote.length){
            return $emote;
        }
        //Otherwise wrap the character in a span and return it
        return $(`<span class = "emoji-wrapper">${emote}</span>`);
    }
}