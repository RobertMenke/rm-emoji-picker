import Emoji from "./Emoji"
import { parseHtml } from './utils'
import category from "./../views/category.mustache"
import type { Converters } from "./converters"

export default class EmojiCategory {

    title : string
    icon : string
    emojis : Array<Emoji>
    converters : Converters
    category : HTMLElement
    category_title : HTMLElement

    constructor(category, data, converters){

        /**
         * @type {string}
         */
        this.title      = category.title

        /**
         *
         * @type {string}
         */
        this.icon       = category.icon


        this.converters = converters

        /**
         * @type {Array<Emoji>}
         */
        this.emojis     = data.map(
            emote => Emoji.factory(
                emote,
                this.title,
                this.converters,
                this._onEvent.bind(this)
            )
        ).sort((a, b) => a.sort_order - b.sort_order )

        /**
         * Markup for the
         */
        this.category  = this.getMarkup()

        /**
         * @type {HTMLElement}
         */
        this.category_title     = this.category.querySelector('.category-title')

        /**
         * Callback that executes when an emoji gets selected
         *
         * @type {Function|undefined}
         * @private
         */
        this._callback  = undefined

        let _search_term = ""
        Object.defineProperty(this, 'search_term', {
            get : () => _search_term,
            set : value => {
                if(_search_term !== value){
                    _search_term = value
                    this._search()
                }
            }
        })
    }

    /**
     * Factory function that initializes the class with a callback
     *
     * @param {Object} cat
     * @param {Object} data
     * @param {Object} converters
     * @param {Function} callback
     * @returns {EmojiCategory}
     */
    static factory(cat, data, converters, callback){
        const category = new EmojiCategory(cat, data, converters)
        category.setCallback(callback)
        return category
    }

    get offset_top (){
        return this.category.offsetTop
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
        if(this.category){
            return this.category
        }

        const fragment = parseHtml(category({
            title : this.title
        }))

        const content = fragment.querySelector('.category-content')

        this.emojis.forEach((emoji : Emoji )=> {
            content.appendChild(emoji.getElement())
        })

        return fragment
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
            this._callback(action, emoji, this)
        }
    }

    /**
     *
     * @param {Function} callback
     * @returns {EmojiCategory}
     */
    setCallback(callback){
        this._callback = callback
        return this
    }

    /**
     * Show/hide emojis based on a search term
     * @private
     */
    _search(){
        if(this.search_term.trim().length === 0){
            this._clearSearch()
        }
        else{
            this.category_title.classList.add('inactive')

            const regexp = new RegExp(this.search_term.toLowerCase())

            this.emojis.forEach(emoji => {
                if(emoji.matchesSearchTerm(regexp)){
                   emoji.show()
                }
                else{
                    emoji.hide()
                }
            })
        }
    }

    /**
     * Clear the effects of the search
     *
     * @returns {EmojiCategory}
     * @private
     */
    _clearSearch() {
        this.category_title.classList.remove('inactive')
        this.emojis.forEach(emoji => emoji.show())

        return this
    }
}