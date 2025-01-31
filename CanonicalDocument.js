const { ScriptureParaDocument } = require('proskomma-render');
const sharedActions = require('./shared_actions');

class CanonicalDocument extends ScriptureParaDocument {

    constructor(result, context, config) {
        super(result, context, config);
        this.head = [];
        this.bodyHead = [];
        this.body = [];
        this.chapter = {
            waiting: false,
            c: null,
            cp: null,
            ca: null,
            cc: 0
        };
        this.verses = {
            waiting: false,
            v: null,
            vp: null,
            va: null
        };
        addActions(this);
    }

    maybeRenderChapter() {
        if (this.chapter.waiting) {
            const chapterLabel = this.chapter.cp || this.chapter.c;
            let chapterId = this.chapter.c;
            if (this.chapter.cpc > 0) {
                chapterId = `${chapterId}_${this.chapter.cpc}`;
            }
            this.context.document.chapters.push([chapterId, chapterLabel]);
            this.body.push(`<h3 class="chapter">${chapterLabel}</h3>\n`);
            this.body.push(`<p class="chapN">Chapter ${chapterLabel}</p>\n`);
            this.chapter.waiting = false;
        }
    }

    maybeRenderVerse() {
        if (this.verses.waiting) {
            const verseLabel = this.verses.vp || this.verses.v;
            this.appendToTopStackRow(`<span class="verses">${verseLabel}</span>&#160;`);
            this.verses.waiting = false;
        }
    }
}

const addActions = (dInstance) => {
    // Initialize headers (not including title) and other state
    dInstance.addAction(
        'startDocument',
        () => true,
        (renderer, context) => {
            let cssPath = "../../CSS/styles.css";
            dInstance.head = [
                '<meta charset=\"utf-8\"/>\n',
                `<link type="text/css" rel="stylesheet" href="${cssPath}" />\n`,
                `<title>${context.document.headers.h}</title>`,
            ];
            dInstance.body = [];
            dInstance.bodyHead = [];
            dInstance.docSetModel.bookTitles[context.document.headers.bookCode] = [
                context.document.headers.h,
                context.document.headers.toc,
                context.document.headers.toc2,
                context.document.headers.toc3,
            ];
            dInstance.chapter = {
                waiting: false,
                c: null,
                cp: null,
                cc: 0
            };
            dInstance.verses = {
                waiting: false,
                v: null,
                vp: null,
                vc: 0
            };
            dInstance.context.document.chapters = [];
        }
    );
    // Follow some block grafts to secondary content
    dInstance.addAction(
        'blockGraft',
        context => ["title", "heading", "introduction"].includes(context.sequenceStack[0].blockGraft.subType),
        (renderer, context, data) => {
            renderer.renderSequenceId(data.payload);
        }
    );
    // Start new stack row for new block
    dInstance.addAction(...sharedActions.startBlock);
    // Render title block
    dInstance.addAction(
        'endBlock',
        context => context.sequenceStack[0].type === "title",
        (renderer, context, data) => {
            const htmlClass = data.bs.payload.split('/')[1];
            const tag = ["mt", "ms"].includes(htmlClass) ? "h1" : "h2";
            const idAtt = htmlClass === 'mt' ? ` id="title_${context.document.headers.bookCode}"` : '';
            renderer.bodyHead.push(`<${tag} class="${htmlClass}"${idAtt}>${renderer.topStackRow().join("").trim()}</${tag}>\n`);
            renderer.popStackRow();
        },
    );
    // Render heading block
    dInstance.addAction(
        'endBlock',
        context => context.sequenceStack[0].type === "heading",
        (renderer, context, data) => {
            const htmlClass = data.bs.payload.split("/")[1];
            let headingTag;
            switch (htmlClass) {
                case "s":
                case "is":
                    headingTag = "h3";
                    break;
                default:
                    headingTag = "h4";
            }
            renderer.body.push(`<${headingTag} class="${htmlClass}">${renderer.topStackRow().join("").trim()}</${headingTag}>\n`);
            renderer.popStackRow();
        },
    );
    // process footnote content
    dInstance.addAction(
        'endBlock',
        context => context.sequenceStack[0].type === "footnote",
        renderer => {
            const footnoteContent = renderer.topStackRow().join("").trim("");
            renderer.popStackRow();
            renderer.context.sequenceStack[1].renderStack[0].push(`<span class="footnote">${footnoteContent}</span>`);
        },
    );
    // Render main or introduction block in a div with class derived from the block scope
    dInstance.addAction(
        'endBlock',
        context => ["main", "introduction"].includes(context.sequenceStack[0].type),
        (renderer, context, data) => {
            const htmlClass = data.bs.payload.split("/")[1];
            renderer.body.push(`<div class="${htmlClass}">${renderer.topStackRow().join("").trim()}</div>\n`);
            renderer.popStackRow();
        },
    );
    // Chapter: maintain state variables, store for rendering by maybeRenderChapter()
    dInstance.addAction(
        'scope',
        (context, data) => data.subType === 'start' && data.payload.startsWith("chapter/"),
        (renderer, context, data) => {
            dInstance.chapter.waiting = true;
            const chapterLabel = data.payload.split("/")[1];
            dInstance.chapter.c = chapterLabel;
            dInstance.chapter.cp = null;
            dInstance.chapter.cpc = 0;
            dInstance.chapter.ca = null;
            dInstance.chapter.cc++
        },
    );
    // pubChapter: maintain state variables, store for rendering by maybeRenderChapter()
    dInstance.addAction(
        'scope',
        (context, data) => data.subType === "start" && data.payload.startsWith("pubChapter/"),
        (renderer, context, data) => {
            dInstance.chapter.waiting = true;
            const chapterLabel = data.payload.split("/")[1];
            dInstance.chapter.cp = chapterLabel;
            dInstance.chapter.cpc++;
        }
    );
    // Verses: maintain state variables, store for rendering by maybeRenderVerse()
    dInstance.addAction(
        'scope',
        (context, data) => data.subType === 'start' && data.payload.startsWith("verses/"),
        (renderer, context, data) => {
            dInstance.verses.waiting = true;
            const verseLabel = data.payload.split("/")[1];
            dInstance.verses.v = verseLabel;
            dInstance.verses.vp = null;
            dInstance.verses.vc++;
        },
    );
    // pubVerse: maintain state variables, store for rendering by maybeRenderVerse()
    dInstance.addAction(
        'scope',
        (context, data) => data.subType === 'start' && data.payload.startsWith("pubVerse/"),
        (renderer, context, data) => {
            dInstance.verses.waiting = true;
            const verseLabel = data.payload.split("/")[1];
            dInstance.verses.vp = verseLabel;
            dInstance.verses.vc++;
        }
    );
    // Character markup - open or close an element
    dInstance.addAction(...sharedActions.characterScope);
    // Unhandled scope
    dInstance.addAction(...sharedActions.w);
    dInstance.addAction(...sharedActions.unhandledScope);
    // Tokens, including attempt to add French spaces and half-spaces after punctuation
    dInstance.addAction(
        'token',
        () => true,
        (renderer, context, data) => {
            let tokenString;
            if (["lineSpace", "eol"].includes(data.subType)) {
                tokenString = " ";
            } else {
                if (context.sequenceStack[0].type === "main") {
                    dInstance.maybeRenderChapter();
                    dInstance.maybeRenderVerse();
                }
                if ([";", "!", "?"].includes(data.payload)) {
                    if (renderer.topStackRow().length > 0) {
                        let lastPushed = renderer.topStackRow().pop();
                        lastPushed = lastPushed.replace(/ $/, "&#8239;");
                        renderer.appendToTopStackRow(lastPushed);
                    }
                    tokenString = data.payload;
                } else if ([":", "»"].includes(data.payload)) {
                    if (renderer.topStackRow().length > 0) {
                        let lastPushed = renderer.topStackRow().pop();
                        lastPushed = lastPushed.replace(/ $/, "&#160;");
                        renderer.appendToTopStackRow(lastPushed);
                    }
                    tokenString = data.payload;
                } else {
                    tokenString = data.payload.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
            }
            return renderer.appendToTopStackRow(tokenString);
        }
    );
        // process footnote
        dInstance.addAction(
            'inlineGraft',
            (context, data) => data.subType === "footnote",
            (renderer, context, data) => {
                renderer.renderSequenceId(data.payload);
            }
        );
    // Generate document HTML
    dInstance.addAction(
        'endSequence',
        context => context.sequenceStack[0].type === "main",
        (renderer, context) => {
           let bodyHead = renderer.bodyHead.join("");
            renderer.config.bookOutput[context.document.headers.bookCode] =
                [
                    '<div class="bibleBook">\n',
                    `<p class="runningHeader">${context.document.headers.toc}</p>\n`,
                    `<header>\n${bodyHead}\n</header>\n`,
                    '<div class="bibleBookBody">\n',
                    renderer.body.join(""),
                    '</div>\n',
                    '</div>\n',
                ].join("");
        }
    );
    // Add hr to separate introduction from main content
    dInstance.addAction(
        'endSequence',
        context => context.sequenceStack[0].type === "introduction",
        renderer => {
            renderer.body.push("<hr/>\n");
        }
    );
};

module.exports = CanonicalDocument;
