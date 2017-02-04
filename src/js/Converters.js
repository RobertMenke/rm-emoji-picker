import EmojiConvertor from "./../../non_npm_dependencies/iamcal_js_emoji/lib/emoji";
import defaults from "./defaults";

"use strict";

class Converters {

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
        if(defaults.use_sheets){
            this.setSheets(defaults.sheets);
        }
    }

    /**
     * Sets the image sheets used by class
     *
     * @param sheets
     */
    setSheets (sheets) {
        sheets = sheets || defaults.sheets;

        [this.withEnvironment(), this.withImage()].forEach(/**EmojiConvertor*/converter => {
            converter.img_sets.apple.sheet    = sheets.apple;
            converter.img_sets.google.sheet   = sheets.google;
            converter.img_sets.twitter.sheet  = sheets.twitter;
            converter.img_sets.emojione.sheet = sheets.emojione;
            converter.use_sheet               = true;
        });
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
     * Tells us whether or not the environment can support
     * unicode emojis.
     *
     * @returns {boolean}
     */
    canSupportUnified () {
        return this.env.replace_mode === "unified";
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
        //We don't want to use images for now - may revisit this in the future.
        if(converter.replace_mode === 'img' || converter.replace_mode === 'css'){
            return Converters.image;
        }
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
        converter.supports_css = true;
        return converter;
    }
}

//Export as a singleton
export default new Converters();