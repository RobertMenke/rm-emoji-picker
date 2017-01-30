import Emoji from "./Emoji";
import category from "./../views/category.mustache";
import $ from "jquery";

export default class EmojiCategory {

    /**
     * Factory function that initializes the class with a callback
     *
     * @param {Object} cat
     * @param {Object} data
     * @param {Function} callback
     * @returns {EmojiCategory}
     */
    static factory(cat, data, callback){
        const category = new EmojiCategory(cat, data);
        category.setCallback(callback);
        return category;
    }

    constructor(category, data){

        /**
         * @type {string}
         */
        this.title      = category.title;

        /**
         *
         * @type {string}
         */
        this.icon       = category.icon;

        /**
         * @type {Array<Emoji>}
         */
        this.emojis     = data.map(
            emote => Emoji.factory(emote, this.title, this._onSelection.bind(this))
        ).sort(
            (a, b) => a.sort_order - b.sort_order
        );

        /**
         * Markup for the
         */
        this.$category  = this.getMarkup();

        /**
         * Callback that executes when an emoji gets selected
         *
         * @type {Function|undefined}
         * @private
         */
        this._callback  = undefined;
    }

    get offset_top (){
        return this.$category.get(0).offsetTop;
    }

    /**
     * Exports the main contents for the category
     *
     * @returns {{title: string, icon: string}}
     */
    exportContents() {
        return {
            title  : this.title,
            icon   : this.icon
        }
    }

    getMarkup(){
        if(this.$category){
            return this.$category;
        }

        const $category = $(category({
            title : this.title
        }));

        const $content = $category.find('.category-content');

        this.emojis.forEach(emoji => {
            $content.append(emoji.getMarkup());
        });

        return $category;
    }

    _onSelection(emoji){
        if(this._callback){
            this._callback.bind(this)(emoji, this);
        }
    }

    /**
     *
     * @param {Function} callback
     * @returns {EmojiCategory}
     */
    setCallback(callback){
        this._callback = callback;
        return this;
    }
}