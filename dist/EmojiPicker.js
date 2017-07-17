"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _EmojiEditor = require("./EmojiEditor");

var _EmojiEditor2 = _interopRequireDefault(_EmojiEditor);

var _EmojiCategory = require("./EmojiCategory");

var _EmojiCategory2 = _interopRequireDefault(_EmojiCategory);

var _Converters = require("./Converters");

var _Converters2 = _interopRequireDefault(_Converters);

var _rmTooltip = require("rm-tooltip");

var _rmTooltip2 = _interopRequireDefault(_rmTooltip);

var _data = require("./data");

var _data2 = _interopRequireDefault(_data);

var _defaults = require("./defaults");

var _defaults2 = _interopRequireDefault(_defaults);

var _picker2 = require("./../views/picker.mustache");

var _picker3 = _interopRequireDefault(_picker2);

var _icon_tooltip = require("./../views/icon_tooltip.mustache");

var _icon_tooltip2 = _interopRequireDefault(_icon_tooltip);

require("./polyfills");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

"use strict";

var EmojiPicker = function () {

    /**
     *
     * @param {undefined|Object} options
     */
    function EmojiPicker() {
        var _this = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        _classCallCheck(this, EmojiPicker);

        this._callback = undefined;

        /**
         * A copy of the defaults object so that state is not
         * mutated with new instances.
         *
         * @type {*}
         */
        this.defaults = Object.assign({}, _defaults2.default);

        if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object") {
            this._setDefaults(options);
        }

        if (typeof options === "function") {
            this._callback = options;
        }

        /**
         *
         * @type {Array.<EmojiCategory>}
         */
        this.categories = this._getCategories();

        /**
         * @type {jQuery}
         */
        this.$picker = this._getPicker();

        /**
         * @type {jQuery}
         */
        this.$active_title = this.$picker.find('#active-title');

        /**
         * @type {jQuery}
         */
        this.$preview_emoji = this.$picker.find('#emoji-large-preview');

        /**
         * @type {jQuery}
         */
        this.$preview_name = this.$picker.find('#emoji-name');

        /**
         * @type {jQuery}
         */
        this.$preview_colon = this.$picker.find('#colon-display');

        /**
         * @type {jQuery}
         */
        this.$content = this.$picker.find('.emoji-content');

        /**
         * @type {jQuery}
         */
        this.$default_footer = this.$picker.find('.default-content');

        /**
         * @type {jQuery}
         */
        this.$preview = this.$picker.find('.emoji-preview');

        /**
         * @type {jQuery}
         */
        this.$search = this.$picker.find('.search-emojis');

        /**
         *
         * @type {HTMLElement|undefined}
         * @private
         */
        this._icon = undefined;

        /**
         *
         * @type {HTMLElement|undefined}
         * @private
         */
        this._container = undefined;

        /**
         *
         * @type {HTMLInputElement|HTMLTextAreaElement|HTMLElement|undefined}
         * @private
         */
        this._input = undefined;

        /**
         * Keeps track of placing the emoji in the input, getting
         * the contents of the editor
         *
         * @type {EmojiEditor|undefined}
         */
        this.editor = undefined;

        var _open = false;
        Object.defineProperty(this, 'picker_open', {
            get: function get() {
                return _open;
            },
            set: function set(value) {
                if (value !== _open) {
                    _open = value;
                    if (_open) {
                        _this.openPicker();
                    } else {
                        _this.$picker.detach();
                    }
                }
            }
        });

        var _active_cat = void 0;
        Object.defineProperty(this, 'active_category', {
            get: function get() {
                return _active_cat;
            },
            set: function set(value) {
                if (!_active_cat || value instanceof _EmojiCategory2.default && value.title !== _active_cat.title) {
                    _active_cat = value;
                    _this.setActiveCategory();
                }
            }
        });

        var _emoji = void 0;
        Object.defineProperty(this, 'active_emoji', {
            get: function get() {
                return _emoji;
            },
            set: function set(value) {
                if (!_emoji || !value || value.full_name !== _emoji.full_name) {
                    _emoji = value;
                    _this._updatePreview();
                }
            }
        });

        this.active_category = this.categories[0];

        this._onScroll()._onCatClick()._onSearch()._setCategoryTooltips();
    }

    /**
     * Renders html or text containing emojis
     *
     * @param str
     * @returns {string}
     */


    _createClass(EmojiPicker, [{
        key: "listenOn",


        /**
         *
         * @param {HTMLElement} icon
         * @param {HTMLElement} container
         * @param {HTMLTextAreaElement|HTMLElement} input
         */
        value: function listenOn(icon, container, input) {
            this._removeOldEvents();
            this._icon = icon;
            this._container = container;
            this._input = input;
            this.editor = new _EmojiEditor2.default(input, this.defaults.prevent_new_line);

            this._onIconClick();
        }

        /**
         * Appends the emoji picker to the DOM
         *
         * @returns {EmojiPicker}
         */

    }, {
        key: "openPicker",
        value: function openPicker() {

            var tooltip = new _rmTooltip2.default(this._icon, this._container, this.$picker);
            tooltip.center();
            //If the developer supplied a function to position the tooltip
            if (typeof this.defaults.positioning === "function") {
                this.defaults.positioning(tooltip);
            } else {

                switch (this.defaults.positioning) {
                    case "autoplace":
                        tooltip.autoPlace(43, 10);
                        break;
                    case "vertical":
                        tooltip.autoPlaceVertically(10);
                        break;
                    case "horizontal":
                        tooltip.autoPlaceHorizontally(10);
                        break;
                    default:
                        tooltip.autoPlace(43, 10);
                        break;
                }
            }

            this._onTooltipClick(tooltip, event);
            this.$content.get(0).scrollTop = this.active_category.offset_top;

            return this;
        }

        /**
         * Getter for the input's text.
         *
         * @returns {*}
         */

    }, {
        key: "getText",
        value: function getText() {
            if (this.editor) {
                return this.editor.getText();
            }

            throw new Error("Did you call this listenOn method first? The listenOn method constructs an instance of EmojiEditor and it appears to be undefined.");
        }

        /**
         * Empties out the input from the editor.
         */

    }, {
        key: "emptyInput",
        value: function emptyInput() {
            if (this.editor) {
                this.editor.empty();
            } else {
                console.log("Did you call the listenOn method first? The EmojiEditor instance is undefined.");
            }
        }

        /**
         * Updates the dom based on the category that became active.
         *
         * @returns {EmojiPicker}
         */

    }, {
        key: "setActiveCategory",
        value: function setActiveCategory() {

            var picker = this;
            this.$picker.find('.select-category').each( /**@this {HTMLElement}*/function () {
                var title = this.getAttribute('data-name');
                if (title === picker.active_category.title) {
                    this.classList.add('active');
                    picker.$active_title.text(picker.active_category.title);
                } else {
                    this.classList.remove('active');
                }
            });

            return this;
        }

        /**
         * Find an emoji category by name.
         *
         * @param name
         * @returns {EmojiCategory}
         */

    }, {
        key: "getCategory",
        value: function getCategory(name) {
            return this.categories.find(function (cat) {
                return cat.title === name;
            });
        }

        /**
         * Finds an individual emoji by name. If the category is known
         * it can be supplied as the second argument to speed up the search.
         *
         * @param {String} name
         * @param {EmojiCategory} category
         * @returns {*}
         */

    }, {
        key: "getEmoji",
        value: function getEmoji(name) {
            var category = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            if (category) {
                return category.emojis.find(function (emote) {
                    return emote.full_name === name;
                });
            }

            return this.categories.find(function (cat) {
                return cat.emojis.find(function (emote) {
                    return emote.full_name === name;
                });
            });
        }

        /**
         * Sets default options based on developer-supplied parameters
         *
         * @param options
         * @private
         */

    }, {
        key: "_setDefaults",
        value: function _setDefaults(options) {
            var _this2 = this;

            var keys = Object.keys(options);
            keys.forEach(function (key) {
                if (_this2.defaults.hasOwnProperty(key)) {
                    _this2.defaults[key] = options[key];
                }
            });

            if (this.defaults.use_sheets) {
                _Converters2.default.setSheets(this.defaults.sheets);
            }
        }

        /**
         * Events from EmojiCategory or Emoji bubble up through a callback
         *
         * @param action
         * @param emoji
         * @param category
         * @private
         */

    }, {
        key: "_dispatchBubble",
        value: function _dispatchBubble(action, emoji, category) {

            var events = _defaults2.default.events;
            switch (action) {
                case events.SELECTED:
                    this._handleSelection(emoji, category);
                    break;
                case events.EMOJI_MOUSEENTER:
                    this.active_emoji = emoji;
                    break;
                case events.EMOJI_MOUSELEAVE:
                    this.active_emoji = undefined;
                    break;
                default:
                    break;
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

    }, {
        key: "_handleSelection",
        value: function _handleSelection(emoji, category) {

            var node = this.editor.placeEmoji(emoji);

            if (typeof this._callback === "function") {
                this._callback(emoji, category, node);
            }

            if (typeof this.defaults.callback === "function") {
                this.defaults.callback(emoji, category, node);
            }

            //Close the picker
            this.picker_open = false;
            this.active_emoji = undefined;
        }

        /**
         *
         * @returns {Array<EmojiCategory>}
         * @private
         */

    }, {
        key: "_getCategories",
        value: function _getCategories() {
            var _this3 = this;

            var cats = this.defaults.categories.map(function (cat) {
                return _EmojiCategory2.default.factory(cat, _data2.default[cat.title], _this3._dispatchBubble.bind(_this3));
            });

            cats[0].$category.addClass('first');
            return cats;
        }

        /**
         * Retrieves the emoji picker
         *
         * @returns {jQuery|HTMLElement}
         * @private
         */

    }, {
        key: "_getPicker",
        value: function _getPicker() {
            var $picker = (0, _jquery2.default)((0, _picker3.default)({
                default_content: _defaults2.default.default_footer_message,
                categories: this.categories.map(function (cat) {
                    return cat.exportContents();
                }),
                search_icon: this.defaults.search_icon
            }));

            var $contents = $picker.find('.emoji-content');

            this.categories.forEach(function (cat) {
                $contents.append(cat.getMarkup());
            });

            return $picker;
        }

        /**
         * Sets a helper tooltip on each category's icon
         *
         * @returns {EmojiPicker}
         * @private
         */

    }, {
        key: "_setCategoryTooltips",
        value: function _setCategoryTooltips() {
            //Only proceed if the picker has been initialized and the developer opted to show tooltips
            if (this.$picker && this.defaults.show_icon_tooltips) {
                //cache an array of category icon wrappers
                var $cats = this.$picker.find('.select-category');
                //Set up a reference to the class instance
                var _picker = this;
                var tooltip = void 0;
                $cats.off('mouseenter.emoji').on('mouseenter.emoji', /**@this {HTMLElement}*/function (event) {
                    //On mouseenter, get the name of the category, then create the tooltip
                    var title = this.getAttribute('data-name');
                    tooltip = new _rmTooltip2.default(this, _picker.$picker.get(0), (0, _jquery2.default)((0, _icon_tooltip2.default)({
                        text: title
                    })));

                    tooltip.below();
                }).off('mouseleave.emoji').on('mouseleave.emoji', function () {
                    tooltip.destroy();
                });
            }

            return this;
        }

        /**
         * Removes any old click handlers on the icon.
         *
         * @returns {EmojiPicker}
         * @private
         */

    }, {
        key: "_removeOldEvents",
        value: function _removeOldEvents() {
            if (this._icon) {
                (0, _jquery2.default)(this._icon).off('click.emoji-picker');
            }

            return this;
        }

        /**
         * Toggle the visibility of the picker when the icon
         * gets clicked.
         *
         * @returns {EmojiPicker}
         * @private
         */

    }, {
        key: "_onIconClick",
        value: function _onIconClick() {
            var _this4 = this;

            (0, _jquery2.default)(this._icon).off('click.emoji').on('click.emoji', function (event) {
                _this4.picker_open = !_this4.picker_open;
            });

            return this;
        }

        /**
         *
         * @param {Tooltip} tooltip
         * @param {Event} event
         * @private
         */

    }, {
        key: "_onTooltipClick",
        value: function _onTooltipClick(tooltip, event) {
            var _this5 = this;

            tooltip.setClickCallback(event, function (target, $tooltip) {
                var $picker = (0, _jquery2.default)(target).closest('#emoji-picker');
                var is_icon = (0, _jquery2.default)(target).is(_this5._icon);

                //If the click occurred outside of the tooltip
                if (!$picker.length && !is_icon) {
                    _this5.picker_open = false;
                }
            });
        }

        /**
         *
         * @returns {EmojiPicker}
         * @private
         */

    }, {
        key: "_onScroll",
        value: function _onScroll() {
            var _this6 = this;

            this.$content.off('scroll.emoji').on('scroll.emoji', function (event) {
                _this6.active_category = _this6._getActiveCategory();
            });

            return this;
        }
    }, {
        key: "_onCatClick",
        value: function _onCatClick() {

            var picker = this;
            this.$picker.find('.select-category').off('click.emoji').on('click.emoji', /**@this {HTMLElement}*/function () {
                var cat = picker.getCategory(this.getAttribute('data-name'));
                picker.$content.get(0).scrollTop = cat.offset_top;
                picker.active_category = picker._getActiveCategory();
            });

            return this;
        }

        /**
         *
         *
         * @returns {EmojiPicker}
         * @private
         */

    }, {
        key: "_onSearch",
        value: function _onSearch() {
            var _this7 = this;

            this.$search.off('input.emoji').on('input.emoji', function () {
                var search = _this7.$search.val().trim();
                _this7.categories.forEach(function (cat) {
                    return cat.search_term = search;
                });
                _this7.$active_title.text("Results for: " + search);
                if (search.length === 0) {
                    _this7.active_category = _this7._getActiveCategory();
                    //Manually call this in case the category hadn't changed since the search started
                    _this7.setActiveCategory();
                }
            });

            return this;
        }

        /**
         * Gets the active category based on scroll position
         *
         * @returns {EmojiCategory}
         * @private
         */

    }, {
        key: "_getActiveCategory",
        value: function _getActiveCategory() {

            var scroll_top = this.$content.get(0).scrollTop;
            var cat = this.categories[0];

            for (var i = 0; i < this.categories.length; i++) {
                if (this.categories[i].offset_top > scroll_top) {
                    return cat;
                }
                cat = this.categories[i];
            }

            return this.categories[this.categories.length - 1];
        }

        /**
         * Updates the preview section with either the default content
         * or
         *
         * @private
         */

    }, {
        key: "_updatePreview",
        value: function _updatePreview() {

            var emoji = this.active_emoji;
            if (emoji) {
                this.$default_footer.hide();
                this.$preview_emoji.html(emoji.getPreview());
                this.$preview_name.text(emoji.short_name);
                if (this.defaults.show_colon_preview) {
                    this.$preview_colon.text(emoji.getColons());
                    this.$preview_name.removeClass('name-only');
                } else {
                    this.$preview_name.addClass('name-only');
                }
                this.$preview.show();
            } else {
                this.$preview.hide();
                this.$default_footer.show();
            }
        }
    }], [{
        key: "render",
        value: function render(str) {

            var converter = _Converters2.default.withEnvironment();
            //If the code is running on a mobile device, don't run replace_unified
            if (_Converters2.default.is_mobile) {
                return converter.replace_colons(str);
            }
            //Otherwise, make an attempt to replace both colons and unified code.
            return converter.replace_unified(converter.replace_colons(str));
        }

        /**
         *
         * @param {object} sheets
         */

    }, {
        key: "setSheets",
        value: function setSheets() {
            var sheets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

            sheets = sheets || _defaults2.default.sheets;
            _Converters2.default.setSheets(sheets);
        }
    }]);

    return EmojiPicker;
}();

exports.default = EmojiPicker;