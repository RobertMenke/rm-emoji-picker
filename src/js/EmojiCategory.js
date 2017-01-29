import Emoji from "./Emoji";
import category from "./../views/category.mustache";
import $ from "jquery";

export default class EmojiCategory {

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
        this.emojis     = data.map(emote => new Emoji(emote));

        this.$category  = this.getMarkup();
    }

    /**
     * Exports the main contents for the category
     *
     * @returns {{title: string, icon: string, emojis: Array}}
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
            $content.append(this.$emoji);
        });

        return $content;
    }
}