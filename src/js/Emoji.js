import { imageConverter, unicodeConverter } from "./converters"
import defaults from "./defaults"
import { getRandomColor, getCodepointsFromString } from "./utils"
import "./polyfills"
import type { Converters } from "./converters"

export default class Emoji {

    converters : Converters
    has_apple_img : boolean
    has_google_img : boolean
    has_twitter_img : boolean
    has_emojione_img : boolean
    category : string
    full_name : string
    short_name : string
    short_names : Array<string>
    sort_order : number
    hover_color : string
    _bubble : ?Function
    emoji : DocumentFragment
    

    constructor(data, category, converters){

        this.converters = converters
        /**
         * @type {Boolean}
         */
        this.has_apple_img    = data['has_img_apple']

        /**
         * @type {Boolean}
         */
        this.has_google_img   = data['has_img_google']

        /**
         * @type {Boolean}
         */
        this.has_twitter_img  = data['has_img_twitter']

        /**
         * @type {Boolean}
         */
        this.has_emojione_img = data['has_img_emojione']

        /**
         * @type {String} - the name of the category
         */
        this.category         = category

        /**
         * @type {String}
         */
        this.full_name        = data['name']

        /**
         * @type {String}
         */
        this.short_name       = data['short_name']

        /**
         * @type {String[]}
         */
        this.short_names      = data['short_names']

        /**
         * @type {Number}
         */
        this.sort_order       = data['sort_order']

        /**
         * @type {String}
         */
        this.hover_color      = getRandomColor()

        /**
         * Gets the emoji for the
         * @type {string}
         */
        this.emoji           = this.getEmojiForPlatform()

        /**
         * Callback executed when the emoji was clicked
         *
         * @type {Function|undefined}
         * @private
         */
        this._bubble        = undefined
        //Set a click listener on the emoji
        this._onClick()
            ._onHover()
    }

    static factory(data, category, converters, callback){
        const emoji = new Emoji(data, category, converters)
        emoji.setCallback(callback)
        return emoji
    }

    /**
     * Getter for the emoji's colon syntax
     *
     * @returns {string}
     */
    getColons () {
        return `:${this.short_name}:`
    }

    /**
     * Getter for the unicode emoji
     *
     * @returns {string}
     */
    getUnified () {
        return this.converters.unicode.replace_colons(this.getColons())
    }

    /**
     * Gets the image representation of an emoji
     *
     * @returns {string}
     */
    getImage () {
        return this.converters.image.replace_colons(this.getColons())
    }

    /**
     * @return {String} Codepoints for the emoji
     */
    getCodepoints () : Array<number> {
        const character = this.getCharacter()
        return getCodepointsFromString(character)
    }

    /**
     * Getter for the emoji character regardless of the platform.
     *
     * @returns {string}
     */
    getCharacter() {
        return this.getUnified()
    }


    /**
     * Gets the platform-appropriate representation of the emoji.
     *
     * @return {DocumentFragment}
     */
    getEmojiForPlatform() : Element {

        const emote = this.converters.image.replace_colons(this.getColons())

        const fragment = this._getWrapper()
        fragment.firstChild.innerHTML = emote

        return fragment.firstElementChild
        // return this._getWrapper().append(emote)
    }

    /**
     *
     * @returns {*}
     */
    getPreview() : Element {
        const emote = this.converters.image.replace_colons(this.getColons())

        const fragment = this._getPreviewWrapper()
        fragment.firstChild.innerHTML = emote

        return fragment.firstElementChild
        // return this._getPreviewWrapper().appendChild(emote)
    }

    getElement () : HTMLElement {
        return this.emoji
    }

    /**
     * Getter for the class' markup
     *
     * @returns {DocumentFragment}
     */
    getEditableFragment() : Element {
        return this.emoji.cloneNode(true)
    }

    /**
     * Sets the callback that gets executed when the emoji gets clicked
     *
     * @param {Function} callback
     * @returns {Emoji}
     */
    setCallback(callback){
        this._bubble = callback
        return this
    }

    /**
     *
     * @param regexp
     * @returns {undefined|String}
     */
    matchesSearchTerm(regexp){
        return this.short_names.find(name => regexp.test(name))
    }

    show () {
        this.emoji.firstChild.styles.display = "none"
    }

    hide () {
        this.emoji.firstChild.styles.display = "inline-block"
    }

    /**
     * Gets the wrapper for the emoji
     *
     * @returns {DocumentFragment}
     * @private
     */
    _getWrapper() : DocumentFragment {
        const fragment = document.createDocumentFragment()
        const span     = document.createElement( 'span' )
        span.className = `emoji-char-wrapper ${this.hover_color}`
        span.setAttribute( 'data-name', this.full_name )
        span.setAttribute( 'data-category', this.category )
        fragment.appendChild( span )

        return fragment
        // return $(`<span class = "emoji-char-wrapper ${this.hover_color}" data-name="${this.full_name}" data-category="${this.category}"></span>`)
    }

    /**
     * Gets the wrapper for the preview
     *
     * @returns {DocumentFragment}
     * @private
     */
    _getPreviewWrapper() : DocumentFragment {
        const fragment = document.createDocumentFragment()
        const span     = document.createElement( 'span' )
        span.className = `emoji-preview-wrapper ${this.hover_color}`
        span.setAttribute( 'data-name', this.full_name )
        span.setAttribute( 'data-category', this.category )
        fragment.appendChild( span )

        return fragment
        // return $(`<!--<span class = "emoji-preview-wrapper ${this.hover_color}" data-name="${this.full_name}" data-category="${this.category}"></span>-->`)
    }

    /**
     *
     * @returns {Emoji}
     * @private
     */
    _onClick(){
        this.emoji.addEventListener('click', () => {
            if(this._bubble){
                this._bubble(defaults.events.SELECTED, this)
            }
        })

        return this
    }

    /**
     *
     * @returns {Emoji}
     * @private
     */
    _onHover () {
        this.emoji.addEventListener('mouseenter', () => {
            if(this._bubble) {
                this._bubble(defaults.events.EMOJI_MOUSEENTER, this)
            }
        })

        this.emoji.addEventListener('mouseleave', () => {
            if(this._bubble) {
                this._bubble(defaults.events.EMOJI_MOUSELEAVE, this)
            }
        })

        return this
    }
}
