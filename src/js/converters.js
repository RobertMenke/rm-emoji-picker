import EmojiConvertor from "emoji-js"
import defaults from "./defaults"
import { deviceIsMobile } from './utils'
"use strict"

export const getConverters = (sheets) => ({
    unicode : getUnicodeConverter(),
    environment : getEnvironmentConverter(),
    image : getImageConverter(sheets)
})

export type Converters = {
    unicode : EmojiConvertor,
    environment : EmojiConvertor,
    image : EmojiConvertor
}

const getUnicodeConverter = () : EmojiConvertor => {
    const converter = new EmojiConvertor()
    converter.init_unified()
    return converter
}

const getEnvironmentConverter = () : EmojiConvertor => {
    const converter = new EmojiConvertor()
    converter.init_env()
    //We don't want to use images for now - may revisit this in the future.
    if(converter.replace_mode === 'img' || converter.replace_mode === 'css'){
        return getImageConverter()
    }
    return converter
}

const getImageConverter = (sheets) : EmojiConvertor => {
    const converter = new EmojiConvertor()
    converter.init_env()
    converter.replace_mode = 'css'
    converter.supports_css = true
    return withSheets(converter, sheets)
}

/**
 *
 * @param converter
 * @param sheets
 * @return EmojiConvertor
 */
const withSheets = (converter : EmojiConvertor, sheets) => {
    console.log(sheets)
    sheets = sheets || defaults.sheets

    converter.img_sets.apple.sheet    = sheets.apple
    converter.img_sets.google.sheet   = sheets.google
    converter.img_sets.twitter.sheet  = sheets.twitter
    converter.img_sets.emojione.sheet = sheets.emojione
    converter.use_sheet               = true

    return converter
}

// export const unicodeConverter   = getUnicodeConverter()
// export const envConverter       = getEnvironmentConverter()
// export const imageConverter     = getImageConverter()
// const is_mobile                 = deviceIsMobile()

/**
 * Tells us whether or not the environment can support
 * unicode emojis.
 *
 * @returns {boolean}
 */
export const canSupportUnified = () : boolean => envConverter.replace_mode === "unified"