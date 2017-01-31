export default {
    categories: [
        {
            title: "People",
            icon : '<i class="fa fa-smile-o" aria-hidden="true"></i>'
        },
        {
            title: "Nature",
            icon : '<i class="fa fa-leaf" aria-hidden="true"></i>'
        },
        {
            title: "Foods",
            icon : '<i class="fa fa-cutlery" aria-hidden="true"></i>'
        },
        {
            title: "Activity",
            icon : '<i class="fa fa-futbol-o" aria-hidden="true"></i>'
        },
        {
            title: "Places",
            icon : '<i class="fa fa-globe" aria-hidden="true"></i>'
        },
        {
            title: "Symbols",
            icon : '<i class="fa fa-lightbulb-o" aria-hidden="true"></i>'
        },
        {
            title: "Flags",
            icon : '<i class="fa fa-flag-checkered" aria-hidden="true"></i>'
        }
    ],

    show_colon_preview: true,

    default_footer_message: "Please select an emoji from the list above",

    positioning: "autoplace",

    callback       : undefined,
    //Track content editable cursor by default. If set to false,
    //the library will not track the cursor position nor place the emoji
    //in the input on selection.
    track_ce_cursor: true,

    events: {
        SELECTED        : "SELECTED",
        EMOJI_MOUSEENTER: "MOUSEENTER",
        EMOJI_MOUSELEAVE: "MOUSELEAVE"
    },

    sheets: {
        apple   : './../sheets/sheet_apple_64_indexed_128.png',
        google  : './../sheets/sheet_google_64_indexed_128.png',
        twitter : './../sheets/sheet_twitter_64_indexed_128.png',
        emojione: './../sheets/sheet_emojione_64_indexed_128.png'
    }
}