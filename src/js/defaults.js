export default {
    //Sets of categories and icons. The category names are not arbitrary, they map
    //to the names of categories in data.js
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

    //By default we show an magnifying glass icon in the search container,
    //but if you're not using fontawesome you may want to include your own icon.
    search_icon : '<i class="fa fa-search" aria-hidden="true"></i>',

    //Show the colon syntax in the preview or don't. It may not make sense if you're
    //using a contenteditable element to confuse users with unfamiliar colon syntax
    show_colon_preview: true,

    //If you want your contenteditable to be a single-line input, set this to true
    prevent_new_line : false,

    //The text that will be displayed when no emoji is being hovered over.
    default_footer_message: "Please select an emoji from the list above",

    //Can be "autoplace", "vertical", "horizontal", or a function that takes a tooltip as an argument.
    //The tooltip is an instance of the class in this repo here: https://github.com/RobertMenke/Tooltip-js
    positioning: "autoplace",

    //Callback that occurs when an emoji gets selected. You get back Emoji, EmojiCategory, Node
    callback       : undefined,

    //When the user hovers over the top row of icons, do you want them to be shown
    //a tooltip indicating which category the icon represents?
    show_icon_tooltips : true,

    //Use sprite sheets to display image emojis rather than links to png files (faster).
    //If you want links to the png files see this repo here for examples (library I'm using):
    //https://github.com/iamcal/emoji-data
    use_sheets : true,

    //Events that bubble up from Emoji to EmojiPicker - DO NOT MUTATE
    //Normally I'd use pubsub here, but didn't feel like writing my own implementation
    //or bringing in another dependency for this simple use case.
    events: {
        SELECTED        : "SELECTED",
        EMOJI_MOUSEENTER: "MOUSEENTER",
        EMOJI_MOUSELEAVE: "MOUSELEAVE"
    },

    //Paths to the sprite sheets (see the sheets folder in this repo. You'll likely
    //need to override this setting.
    sheets: {
        apple   : './sheets/sheet_apple_64_indexed_128.png',
        google  : './sheets/sheet_google_64_indexed_128.png',
        twitter : './sheets/sheet_twitter_64_indexed_128.png',
        emojione: './sheets/sheet_emojione_64_indexed_128.png'
    }
}