import defaultExtensions from '../../src/extensions/default';
import defaultProperties from '../../src/default-properties';
import LineageGuide from '../../src/guides/search-lineage';
import parser from "../../src/parser";
import dom from "../dom";

describe("Guide: Search lineage", function () {
    let lineageGuide;
    let scopeElement;
    let config = {
        defaultProperties:defaultProperties,
        extensions: defaultExtensions.concat({
            labels: {
                "customlabel": function (data, callback) {
                    return callback(null, dom.get("custom"));
                },

                "customClassLabel": function (data, callback) {
                    return callback(null, dom.get("target"));
                }
            }
        })
    }

    beforeEach(function () {
        scopeElement = document.body;
        document.body.innerHTML = "";
        lineageGuide = new LineageGuide();
    });

    it("should find within a container", function () {
        dom.render(
            <div className="parent">
                <div id="target">child</div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("parent>child"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should find next to", function () {
        dom.render(
            <div className="parent">
                <div>sibling 1</div>
                <div id="target">sibling 2</div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("sibling 1>sibling 2"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should find all children within a container", function () {
        dom.render(
            <div className="parent">
                <div id="target-1">child</div>
                <div id="target-2">another one</div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("parent>div"), scopeElement, config}).should.deep.equal(dom.get('target-1', 'target-2'));
    });

    it("should traverse the dom looking for items in multiple containers", function () {
        dom.render(
            <div className="box3">
                <div className="inner-box">
                    <div className="box3-item-1">Item 1 in box 3</div>
                    <div className="box3-item-2" id="target">Item 2</div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("Item 1 in box 3>Item 2"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should find duplicates at different levels", function () {
        dom.render(
            <div className="box4">
                <div className="inner-box">
                    <div className="box4-item-1">Item 1</div>
                    <div className="box4-duplicate-a" id="target-1">Duplicate A</div>
                    <div className="inner-inner-box">
                        <div className="box4-item-2">Item 2</div>
                        <div className="box4-duplicate-a-2" id="target-2">Duplicate A</div>
                    </div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("box4>Duplicate A"), scopeElement, config}).should.deep.equal(dom.get('target-1', 'target-2'));
    });

    it("should traverse the dom looking for items in parent containers", function () {
        dom.render(
            <div className="box5">
                <div className="inner-box">
                    <div className="box5-item-1" id="target">Item 1</div>
                </div>
                <div className="inner-box">
                    <div className="box5-item-2">Item 2</div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("box5>inner-box>Item 1"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should only crawl parents til first find", function () {
        dom.render(
            <div className="box6">
                <div>
                    <div>
                        <div>
                            <div className="box6-item-A" id="target">Item A</div>
                            <div>
                                <div className="box6-item-B">Item B</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="box6-item-A-2">Item A</div>
                    </div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("Item B>Item A"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should look by class near a container", function () {
        dom.render(
            <div className="box7">
                <div>Item Content</div>
                <div className="class-name" id="target"></div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("box7>Item Content>class-name"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should look by node type near a container", function () {
        dom.render(
            <div className="box8">
                <div>Item Content</div>
                <input className="input-near-content" id="target"/>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("Item Content>input-near-content"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should look within a custom label", function () {
        dom.render(
            <div className="box9">
                <div className="random">
                    <div>Custom data</div>
                    <div id="custom">
                        <div className="box9-item-1" id="target">Item 1</div>
                    </div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("box9>customlabel>Item 1"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should find the custom label in container", function () {
        dom.render(
            <div className="box10">
                <div className="custom-class">Outside</div>
                <div>
                    <div className="label-container">
                        <div>Container Label For Custom Class</div>
                        <div className="custom-class" id="target">Inside</div>
                    </div>
                    <div className="label-container">
                        <div>Another Container Label For Another Custom Class</div>
                        <div className="custom-class">Inside 2</div>
                    </div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("Container Label For Custom Class>customClassLabel"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("Should limit and narrow the search to containers found", function () {
        dom.render(
            <div className="box11">
                <div className="outer-parent">
                    <div className="parent">
                        <div>reference 1</div>
                        <div className="target-1" id="target">target</div>
                    </div>
                    <div className="parent">
                        <div className="target-2">target</div>
                    </div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("reference 1 > parent > target"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("Should get duplicates within multiple scopes", function () {
        dom.render(
            <div>
                <div>
                    <div>item A</div>
                    <div id="target-1">item B</div>
                </div>
                <div>
                    <div>item A</div>
                    <div id="target-2">item B</div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("item A > item B"), scopeElement, config}).should.deep.equal(dom.get('target-1', 'target-2'));
    });

    it("Should get nth position for a simple list", function () {
        dom.render(
            <div>
                <div>item 1</div>
                <div>item 2</div>
                <div id="target">item 3</div>
                <div>item 4</div>
                <div>item 5</div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("item#3"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("Should get nth position for a scopeElement", function () {
        dom.render(
            <div>
                <div>
                    <div>item 1</div>
                    <div>another A</div>
                </div>
                <div>
                    <div>item 2</div>
                    <div id="target">another A</div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("item#2 > another A"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("Should get nth position for a target in a scopeElement", function () {
        dom.render(
            <div>
                <div>
                    <div>item 1</div>
                    <div>another A</div>
                </div>
                <div>
                    <div>item 2</div>
                    <div id="target">another A</div>
                </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("item > another A#2"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("Should not have a scope match the end target", function() {
        dom.render(
            <div>
                <div className="thing">item </div>
            </div>
        );

        lineageGuide.search({scopes:parser.parse("thing > item"), scopeElement, config}).should.deep.equal([]);
    });

    it("should narrow down scope elements with inner selectors", function () {
        dom.render(<div>
            <span className="block wide">
                <div id="target">item</div>
            </span>
            <span>item</span>
        </div>);

        lineageGuide.search({scopes:parser.parse("block^wide > item"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });

    it("should find a non intersecting element even if the scope collides", function () {
        dom.render(<div>
            <div className="item">
                <span id="target">item</span>
            </div>
        </div>);

        lineageGuide.search({scopes:parser.parse("item > target"), scopeElement, config}).should.deep.equal([dom.get('target')]);
    });
});