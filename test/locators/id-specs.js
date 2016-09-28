import dom from "../dom"
import extension from '../../src/extensions/search-as-id';

describe("Locator: Exact Match", function () {
    let findByID = extension.properties.searchasid.locate;
    beforeEach(function () {
        document.body.innerHTML = "";
    });

    it("should find by id", function () {
        dom.render(<div id="unique-id">text</div>);

        findByID({label: "unique-id", scopeElement: document.body}).should.deep.equal([dom.get("unique-id")]);
    });

    it("should not find by id", function () {
        dom.render(<div id="unique-id"></div>);

        findByID({label: "missing-id", scopeElement: document.body}).should.deep.equal([]);
    });
});