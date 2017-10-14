"use strict"
import EmojiEditor from "./EmojiEditor"
import EmojiCategory from "./EmojiCategory"
import Tooltip from "rm-tooltip"
import emojis from "./data"
import defaults from "./defaults"
import picker from "./../views/picker.mustache"
import icon_tooltip from "./../views/icon_tooltip.mustache"
import { detachNode, deviceIsMobile, parseHtml, replaceChildren } from "./utils"
import { getConverters } from "./converters"
import "./polyfills"
import type { config } from './defaults'
import type Emoji from "./Emoji"



export default class EmojiPicker {

    defaults : config
    categories : Array<EmojiCategory>
    picker : HTMLElement

    constructor(options : ?config|?Function = undefined){

        this._callback = undefined

        /**
         * A copy of the defaults object so that state is not
         * mutated with new instances.
         *
         * @type {*}
         */
        this.defaults   = Object.assign({}, defaults)

        if(typeof options === "object"){
            this._setDefaults(options)
        }

        if(typeof options === "function"){
            this._callback = options
        }

        this.converters        = getConverters( this.defaults.sheets )
        this.categories        = this._getCategories()
        this.picker            = this._getPicker()
        this.active_title      = this.picker.querySelector( '#active-title' )
        this.preview_emoji     = this.picker.querySelector( '#emoji-large-preview' )
        this.preview_name      = this.picker.querySelector( '#emoji-name' )
        this.preview_colon     = this.picker.querySelector( '#colon-display' )
        this.content           = this.picker.querySelector( '.emoji-content' )
        this.default_footer    = this.picker.querySelector( '.default-content' )
        this.preview           = this.picker.querySelector( '.emoji-preview' )
        this.search            = this.picker.querySelector( '.search-emojis' )

        /**
         *
         * @type {HTMLElement|undefined}
         * @private
         */
        this._icon      = undefined

        /**
         *
         * @type {HTMLElement|undefined}
         * @private
         */
        this._container = undefined

        /**
         *
         * @type {HTMLInputElement|HTMLTextAreaElement|HTMLElement|undefined}
         * @private
         */
        this._input     = undefined

        /**
         * Keeps track of placing the emoji in the input, getting
         * the contents of the editor
         *
         * @type {EmojiEditor|undefined}
         */
        this.editor    = undefined


        let _open = false
        Object.defineProperty(this, 'picker_open', {
            get : () => _open,
            set : value => {
                if(value !== _open){
                    _open = value
                    //Used to call this.openPicker() when _open was true, but there was a reference error bug in
                    //this issue https://github.com/RobertMenke/rm-emoji-picker/issues/27
                    //I need to pass the click event to this.openPicker so for now we'll only handle
                    //Closing the picker in this setter
                    if(!_open){
                        detachNode(this.picker)
                    }
                }
            }
        })

        let _active_cat
        Object.defineProperty(this, 'active_category', {
            get : () => _active_cat,
            set : value => {
                if(!_active_cat || (value instanceof EmojiCategory && value.title !== _active_cat.title)){
                    _active_cat = value
                    this.setActiveCategory()
                }
            }
        })

        let _emoji
        Object.defineProperty(this, 'active_emoji', {
           get : () => _emoji,
            set : value => {
               if(!_emoji || !value || (value.full_name !== _emoji.full_name)){
                   _emoji = value
                   this._updatePreview()
               }
            }
        })

        this.active_category = this.categories[0]

        this._onScroll()
            ._onCatClick()
            ._onSearch()
            ._setCategoryTooltips()
    }

    /**
     * Renders html or text containing emojis
     *
     * @param str
     * @returns {string}
     */
    static render(str) {
        //If the code is running on a mobile device, don't run replace_unified
        if (deviceIsMobile) {
            return this.converters.unicode.replace_colons( str )
        }
        //Otherwise, make an attempt to replace both colons and unified code.
        return this.converters.image.replace_unified(
            this.converters.image.replace_colons(
                str
            )
        )
    }

    /**
     *
     * @param {HTMLElement} icon
     * @param {HTMLElement} container
     * @param {HTMLTextAreaElement|HTMLElement} input
     */
    listenOn(icon : HTMLElement, container : HTMLElement, input : HTMLTextAreaElement|HTMLElement){
        this._removeOldEvents()
        this._icon                = icon
        this._container           = container
        this._input               = input
        this.editor               = new EmojiEditor(input, this.converters, this.defaults.prevent_new_line)

        this._onIconClick()
    }

    /**
     * Appends the emoji picker to the DOM
     *
     * @returns {EmojiPicker}
     */
    openPicker(event : MouseEvent) {

        const tooltip = new Tooltip(this._icon, this._container, this.picker)
        tooltip.center()
        //If the developer supplied a function to position the tooltip
        if(typeof this.defaults.positioning === "function"){
            this.defaults.positioning(tooltip)
        }
        else {

            switch (this.defaults.positioning) {
                case "autoplace":
                    tooltip.autoPlace(43, 10)
                    break
                case "vertical":
                    tooltip.autoPlaceVertically(10)
                    break
                case "horizontal":
                    tooltip.autoPlaceHorizontally(10)
                    break
                default:
                    tooltip.autoPlace(43, 10)
                    break
            }
        }

        this._onTooltipClick(tooltip, event)
        this.content.scrollTop = this.active_category.offset_top

        return this
    }

    /**
     * Getter for the input's text.
     *
     * @returns {*}
     */
    getText () {
        if(this.editor){
            return this.editor.getText()
        }

        throw new Error("Did you call the listenOn method first? The listenOn method constructs an instance of EmojiEditor and it appears to be undefined.")
    }

    /**
     * Empties out the input from the editor.
     */
    emptyInput () {
        if(this.editor){
            this.editor.empty()
        }
        else{
            console.warn("Did you call the listenOn method first? The EmojiEditor instance is undefined.")
        }
    }

    /**
     * Updates the dom based on the category that became active.
     *
     * @returns {EmojiPicker}
     */
    setActiveCategory () {
        const picker = this
        const categories = Array.from(this.picker.querySelectorAll('.select-category'))
        categories.forEach((category : HTMLElement) => {
            const title = category.getAttribute('data-name')
            if(title === picker.active_category.title){
                category.classList.add('active')
                picker.active_title.textContent = picker.active_category.title
            }
            else{
                category.classList.remove('active')
            }
        })

        return this
    }

    /**
     * Find an emoji category by name.
     *
     * @param name
     * @returns {EmojiCategory}
     */
    getCategory(name){
        return this.categories.find(cat => cat.title === name)
    }

    /**
     * Finds an individual emoji by name. If the category is known
     * it can be supplied as the second argument to speed up the search.
     *
     * @param {String} name
     * @param {EmojiCategory} category
     * @returns {*}
     */
    getEmoji(name, category = undefined){
        if(category){
            return category.emojis.find(emote => emote.full_name === name)
        }

        return this.categories.find(cat =>
            cat.emojis.find(emote => emote.full_name === name)
        )
    }

    /**
     * Sets default options based on developer-supplied parameters
     *
     * @param options
     *
     */
    _setDefaults(options){
        const keys = Object.keys(options)
        keys.forEach(key => {
            if(this.defaults.hasOwnProperty(key)){
                this.defaults[key] = options[key]
            }
        })
    }

    /**
     * Events from EmojiCategory or Emoji bubble up through a callback
     *
     * @param action
     * @param emoji
     * @param category
     * @private
     */
    _dispatchBubble(action : string, emoji : Emoji, category : EmojiCategory){

        const events = defaults.events
        switch(action){
            case events.SELECTED:
                this._handleSelection(emoji, category)
                break
            case events.EMOJI_MOUSEENTER:
                this.active_emoji = emoji
                break
            case events.EMOJI_MOUSELEAVE:
                this.active_emoji = undefined
                break
            default:
                break
        }
    }

    /**
     * When an emoji gets clicked on the selection bubbles up
     * to the EmojiPicker object. First, we place the emoji in
     * the input and then fire off any callback that were supplied.
     *
     *
     * @param {Emoji} emoji
     * @param {EmojiCategory} category
     * @private
     */
    _handleSelection(emoji : Emoji, category : EmojiCategory){

        const node = this.editor.placeEmoji(emoji)

        if(typeof this._callback === "function"){
            this._callback(emoji, category, node)
        }

        if(typeof this.defaults.callback === "function"){
            this.defaults.callback(emoji, category, node)
        }

        //Close the picker
        this.picker_open  = false
        this.active_emoji = undefined
    }

    /**
     *
     * @returns {Array<EmojiCategory>}
     * @private
     */
    _getCategories() {
        const cats = this.defaults
                         .categories
                         .map(cat => EmojiCategory.factory(cat, emojis[cat.title], this.converters, this._dispatchBubble.bind(this)))

        cats[0].category.classList.add('first')
        return cats
    }

    /**
     * Retrieves the emoji picker
     *
     * @returns {HTMLElement}
     * @private
     */
    _getPicker() {
        const fragment = parseHtml(picker({
            default_content: defaults.default_footer_message,
            categories     : this.categories.map(cat => cat.exportContents()),
            search_icon    : this.defaults.search_icon
        }))

        const contents = fragment.querySelector('.emoji-content')

        this.categories.forEach(cat => {
            contents.append(cat.getMarkup())
        })

        return fragment
    }

    /**
     * Sets a helper tooltip on each category's icon
     *
     * @returns {EmojiPicker}
     * @private
     */
    _setCategoryTooltips(){
        //Only proceed if the picker has been initialized and the developer opted to show tooltips
        if(this.picker instanceof HTMLElement && this.defaults.show_icon_tooltips){
            //cache an array of category icon wrappers
            const cats  = Array.from(this.picker.querySelectorAll('.select-category'))
            let tooltip
            //Set up a reference to the class instance
            cats.forEach((category : HTMLElement) => {
                category.addEventListener('mouseenter', () => {
                    //On mouseenter, get the name of the category, then create the tooltip
                    const title = category.getAttribute('data-name')
                    tooltip     = new Tooltip(category, this.picker, parseHtml(icon_tooltip({
                        text: title
                    })))

                    tooltip.below()
                })

                category.addEventListener('mouseleave', () => {
                    tooltip.destroy()
                })
            })
        }

        return this
    }

    /**
     * Removes any old click handlers on the icon.
     *
     * @returns {EmojiPicker}
     * @private
     */
    _removeOldEvents (){
        if(this._icon){
            this._icon.removeEventListener('click')
        }

        return this
    }

    /**
     * Toggle the visibility of the picker when the icon
     * gets clicked.
     *
     * @returns {EmojiPicker}
     * @private
     */
    _onIconClick() {
        this._icon.addEventListener('click', (event : MouseEvent) => {
            if(!this.picker_open) {
                this.openPicker(event)
            }
            this.picker_open = !this.picker_open
        })

        return this
    }

    /**
     *
     * @param {Tooltip} tooltip
     * @param {Event} event
     * @private
     */
    _onTooltipClick(tooltip, event){
        tooltip.setClickCallback(event, (target : HTMLElement) => {
            const picker_node = target.closest('#emoji-picker')
            const is_icon = target.nodeName === this._icon.nodeName
                        && target.className === this._icon.className
                        && target.id === this._icon.id

            //If the click occurred outside of the tooltip
            if(picker_node && !is_icon){
                this.picker_open = false
            }
        })
    }

    /**
     *
     * @returns {EmojiPicker}
     * @private
     */
    _onScroll(){
        this.content.addEventListener('scroll', () => {
            this.active_category = this._getActiveCategory()
        })

        return this
    }

    _onCatClick() {

        const categories = Array.from(this.picker.querySelectorAll('.select-category'))
        categories.forEach((category : HTMLElement) => {
            const cat              = this.getCategory( category.getAttribute( 'data-name' ) )
            this.content.scrollTop = cat.offset_top
            this.active_category   = this._getActiveCategory()
        })

        return this
    }

    /**
     *
     *
     * @returns {EmojiPicker}
     * @private
     */
    _onSearch() {
        this.search.addEventListener('input', () => {
            const search = this.search.value.trim()
            this.categories.forEach(cat => cat.search_term = search)
            this.active_title.textContent = `Results for: ${search}`
            if(search.length === 0){
                this.active_category = this._getActiveCategory()
                //Manually call this in case the category hadn't changed since the search started
                this.setActiveCategory()
            }
        })

        return this
    }

    /**
     * Gets the active category based on scroll position
     *
     * @returns {EmojiCategory}
     * @private
     */
    _getActiveCategory() {

        const scroll_top = this.content.scrollTop
        let cat          = this.categories[0]
        for(let i = 0; i < this.categories.length; i++){
            const offset = this.categories[i].category.offsetTop
            //Account for the case where the DOM elements haven't been rendered and don't have a scroll top
            if(offset > scroll_top || scroll_top === 0){
                return cat
            }
            cat = this.categories[i]
        }

        return this.categories[this.categories.length - 1]
    }

    /**
     * Updates the preview section with either the default content
     * or
     *
     * @private
     */
    _updatePreview() {

        const emoji = this.active_emoji
        console.log(emoji)
        if (emoji) {
            this.default_footer.style.display = "none"
            this.preview_emoji = replaceChildren(this.preview_emoji, emoji.getPreview())
            this.preview_name.textContent = emoji.short_name
            if (this.defaults.show_colon_preview) {
                this.preview_colon.textContent = emoji.getColons()
                this.preview_name.classList.add('name-only')
            }
            else {
                this.preview_name.classList.add('name-only')
            }
            this.preview.style.display = "block"
        }
        else {
            this.preview.style.display = "none"
            this.default_footer.style.display = "block"
        }
    }
}