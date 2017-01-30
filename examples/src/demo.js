import $ from "jquery";
import EmojiPicker from "./../../src/js/EmojiPicker";

$(document).ready(() => {


    const icon      = document.querySelector('.fa-smile-o');
    const container = document.getElementById('container');
    const input     = document.getElementById('text-input');

    const picker = new EmojiPicker();
    $("body").append(picker.categories.reduce((carry, cat) => `${carry} ${cat.title}`, ""));
    picker.listenOn(icon, container, input);

});