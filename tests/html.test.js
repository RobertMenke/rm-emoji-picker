"use strict"
import { parseHtml } from "./../src/js/utils"

describe("Parsing html", () => {
    it("should be able to parse html from a string", () => {
        const mock_html = "<div class=\"test\"><span>text</span></div>"
        const parsed_html = parseHtml(mock_html)
        expect(parsed_html.nodeName).toBe("DIV")
        expect(parsed_html.className).toBe("test")
        expect(parsed_html.firstChild.textContent).toBe("text")
    })
})
