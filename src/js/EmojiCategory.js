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
            emote => Emoji.factory(emote, this.title, this._onEvent.bind(this))
        ).sort(
            (a, b) => a.sort_order - b.sort_order
        );

        /**
         * Markup for the
         */
        this.$category  = this.getMarkup();

        /**
         * @type {jQuery}
         */
        this.$title     = this.$category.find('.category-title');

        /**
         * Callback that executes when an emoji gets selected
         *
         * @type {Function|undefined}
         * @private
         */
        this._callback  = undefined;

        let _search_term = "";
        Object.defineProperty(this, 'search_term', {
            get : () => _search_term,
            set : value => {
                if(_search_term !== value){
                    _search_term = value;
                    this._search();
                }
            }
        });
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

    /**
     * Carries an event from the Emoji to the EmojiPicker instance.
     *
     * @param action
     * @param emoji
     * @private
     */
    _onEvent(action, emoji){
        if(this._callback){
            this._callback(action, emoji, this);
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

    /**
     * Show/hide emojis based on a search term
     * @private
     */
    _search(){
        if(this.search_term.trim().length === 0){
            this._clearSearch();
        }
        else{
            this.$title.addClass('inactive');

            const regexp = new RegExp(this.search_term.toLowerCase());

            this.emojis.forEach(emoji => {
                if(emoji.matchesSearchTerm(regexp)){
                   emoji.$emoji.show();
                }
                else{
                    emoji.$emoji.hide();
                }
            });
        }
    }

    /**
     * Clear the effects of the search
     *
     * @returns {EmojiCategory}
     * @private
     */
    _clearSearch() {
        this.$title.removeClass('inactive');
        this.emojis.forEach(emoji => emoji.$emoji.show());

        return this;
    }
}