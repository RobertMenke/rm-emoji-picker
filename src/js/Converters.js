import EmojiConvertor from "./../../non_npm_dependencies/iamcal_js_emoji/lib/emoji";

"use strict";

export default class Converters {

    /**
     *
     * @returns {Converters}
     */
    static factory() {
        return new Converters();
    }

    /**
     * Set up each type of converter
     */
    constructor(){
        this.unicode = Converters.unified;
        this.env     = Converters.environment;
        this.css     = Converters.image;
    }

    /**
     * Conduct the next operation with the unified converter
     *
     * @returns {emoji|*}
     */
    withUnified (){
        return this.unicode;
    }

    /**
     * Conduct the next operation with the environment converter
     *
     * @returns {emoji|*}
     */
    withEnvironment(){
        return this.env;
    }

    /**
     * Conduct the next operation with the css-based image converter
     *
     * @returns {emoji|*}
     */
    withImage(){
        return this.css;
    }

    /**
     * Getter for unified converter
     *
     * @returns {emoji}
     */
    static get unified(){
        const converter = new EmojiConvertor();
        converter.init_unified();
        return converter;
    }

    /**
     * Getter for environment converter
     *
     * @returns {emoji}
     */
    static get environment(){
        const converter = new EmojiConvertor();
        converter.init_env();
        return converter;
    }

    /**
     * Getter for css-based image converter
     *
     * @returns {emoji}
     */
    static get image() {
        const converter = new EmojiConvertor();
        converter.init_env();
        converter.replace_mode = 'css';
        return converter;
    }
}