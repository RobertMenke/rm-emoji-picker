//@flow
'use strict'

const colors = ["blue", "yellow", "green", "orange", "indigo", "pink"]

export const getRandomColor = () : string => colors[getRandomIntFromInterval(0, colors.length - 1)]

export const getRandomIntFromInterval = (min : number, max : number) : number => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const dispatchEvents = (element : HTMLElement, events : Array<string> | string) : HTMLElement => {
    const normalized = Array.isArray(events) ? events : Array.of(events)
    normalized.forEach(event => element.dispatchEvent(createLegacyEvent(event)))
    return element
}

export const createLegacyEvent = (event_name : string) => {
    const event = document.createEvent('Event')
    event.initEvent(event_name, true, true)
    return event
}

export const parseCodepoints = (codepoints : string) : string => {
    if(/-/g.test(codepoints)){
        const arr = codepoints.split("-").map(str => `0x${str}`)
        return String.fromCodePoint(...arr)
    }
    return String.fromCodePoint(`0x${codepoints}`)
}

export const isContentEditable = (element : HTMLElement) : boolean => {
    const tag = element.nodeName
    return element.isContentEditable && tag !== "INPUT" && tag !== "TEXTAREA"
}

/**
 * Selects the contents of an element.
 *
 *
 * Credit goes to Tim Down here
 *
 * @param element
 */
export const selectElementContents = (element : HTMLElement)  => {
    const range = document.createRange()
    range.selectNodeContents( element )
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange( range )
}

/**
 * Pastes html at the caret. Note that to do this without placing the
 * cursor inside of the html you need to add a dummy unicode character.
 * For our purposes we'll add the 0-width space and then strip it out when we parse the output
 *
 * Credit goes to Tim Down here
 *
 * @param html
 * @param select_pasted_content
 * @returns {*}
 */
export const pasteHtmlAtCaret  = (html : string, select_pasted_content : boolean) => {
    let sel, range
    if(window.getSelection){
        //IE9+ and non-IE
        sel = window.getSelection()
        if(sel.getRangeAt && sel.rangeCount){
            range = sel.getRangeAt(0)
            range.deleteContents()

            const el = document.createElement("div")
            el.innerHTML = html
            let frag = document.createDocumentFragment(), node, last_node
            while((node = el.firstChild)){
                last_node = frag.appendChild(node)
            }

            const first_node = frag.firstChild
            range.insertNode(frag)

            //Preserve the selection
            if(last_node){
                range = range.cloneRange()
                range.setStartAfter(last_node)
                if(select_pasted_content){
                    range.setStartBefore(first_node)
                }
                else{
                    range.collapse(false)
                }
                sel.removeAllRanges()
                sel.addRange(range)
            }

            return first_node
        }
    }
}

/**
 * saves the position of the cursor in a contenteditable div
 *
 * Credit goes to Tim Down here
 *
 * @returns {TextRange|Range|null}
 */
export const saveSelection = () => {
    if(window.getSelection){
        const sel = window.getSelection()
        if(sel.getRangeAt && sel.rangeCount){
            return sel.getRangeAt(0)
        }
    }

    return null
}

/**
 * Selects an element an optionally highlights it. If it doesn't highlight,
 * it just drops the cursor at the end of the element.
 *
 *
 * Credit goes to Tim Down here
 *
 * @param element
 * @param highlight
 */
export const selectElement = (element : HTMLElement, highlight : boolean = false) => {
    if(window.getSelection){
        const sel = window.getSelection()
        sel.removeAllRanges()
        const range = document.createRange()
        range.selectNodeContents(element)
        if(!highlight){
            range.collapse(false)
        }
        sel.addRange(range)
    }
}

/**
 * Pastes text at the caret position
 *
 * Credit goes to Tim Down here
 *
 * @param text
 * @returns {Text}
 */
export const pasteTextAtCaret = (text : string) => {
    const node = document.createTextNode(text)
    if(window.getSelection){
        const sel = window.getSelection()
        if(sel.getRangeAt && sel.rangeCount){
            const range = sel.getRangeAt(0)
            range.deleteContents()
            range.insertNode(node)
        }
    }

    return node
}


/**
 * Restores the selection using a Range object
 *
 * Credit goes to Tim Down here
 *
 * @param {Range} range
 */
export const restoreSelection = (range : Range) : void => {
    if(range){
        if(window.getSelection){
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
        }
    }
}

