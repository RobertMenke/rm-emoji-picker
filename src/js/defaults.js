
export default {
    categories : [
        {
            title : "People",
            icon  : '<i class="fa fa-smile-o" aria-hidden="true"></i>'
        },
        {
            title : "Nature",
            icon  : '<i class="fa fa-leaf" aria-hidden="true"></i>'
        },
        {
            title : "Foods",
            icon  : '<i class="fa fa-cutlery" aria-hidden="true"></i>'
        },
        {
            title : "Activity",
            icon  : '<i class="fa fa-futbol-o" aria-hidden="true"></i>'
        },
        {
            title : "Places",
            icon  : '<i class="fa fa-globe" aria-hidden="true"></i>'
        },
        {
            title : "Symbols",
            icon  : '<i class="fa fa-lightbulb-o" aria-hidden="true"></i>'
        },
        {
            title : "Flags",
            icon  : '<i class="fa fa-flag-checkered" aria-hidden="true"></i>'
        }
    ],

    default_content : "",

    positioning     : "autoplace",

    callback        : undefined,
    //Track content editable cursor by default. If set to false,
    //the library will not track the cursor position nor place the emoji
    //in the input on selection.
    track_ce_cursor : true
}