import $ from "jquery";
import EmojiPicker from "./../../dist/EmojiPicker";

$(document).ready(() => {

    const icon      = document.querySelector('.fa-smile-o');
    const container = document.getElementById('container');
    const input     = document.getElementById('text-input');

    const picker = new EmojiPicker({
        sheets: {
            apple   : './../sheets/sheet_apple_64_indexed_128.png',
            google  : './../sheets/sheet_google_64_indexed_128.png',
            twitter : './../sheets/sheet_twitter_64_indexed_128.png',
            emojione: './../sheets/sheet_emojione_64_indexed_128.png'
        },
        positioning : "vertical"
    });
    picker.listenOn(icon, container, input);

    setInterval(() => {
        console.log(picker.getText());
    }, 3000);
});