export class Range {
    startChapter;
    startVerse;
    endChapter;
    endVerse;
    constructor(startChapter, startVerse, endChapter, endVerse) {
        this.startChapter = startChapter;
        this.startVerse = startVerse;
        this.endChapter = endChapter;
        this.endVerse = endVerse;
    }
    static fromVerseRefs(startVerse, endVerse) {
        return new Range(startVerse.chapter, startVerse.verse, endVerse.chapter, endVerse.verse);
    }
    isSingleVerse() {
        return (this.startChapter === this.endChapter &&
            this.startVerse === this.endVerse);
    }
    isSingleChapter() {
        return this.startChapter === this.endChapter;
    }
    spansChapters() {
        return this.startChapter !== this.endChapter;
    }
    isValidInBook(book, system = 'english') {
        return (this.startChapter > 0 &&
            this.endChapter > 0 &&
            this.startVerse > 0 &&
            this.endVerse > 0 &&
            this.startChapter <= book.chapterCount &&
            this.endChapter <= book.chapterCount);
    }
    fullChaptersInBook(book, system = 'english') {
        return (this.startVerse === 1 &&
            this.endVerse === book.verseCount(this.endChapter, system));
    }
    fullBook(book, system = 'english') {
        return (this.fullChaptersInBook(book, system) &&
            this.startChapter === 1 &&
            this.endChapter === book.chapterCount);
    }
    toString(excludeChapters = false, excludeVerses = false) {
        return excludeChapters
            ? this.outputWithoutChapters(excludeVerses)
            : this.outputWithChapters(excludeVerses);
    }
    outputWithChapters(excludeVerses) {
        if (this.isSingleVerse()) {
            return `${this.startChapter}:${this.startVerse}`;
        }
        else if (this.isSingleChapter()) {
            if (excludeVerses) {
                return `${this.startChapter}`;
            }
            else {
                return `${this.startChapter}:${this.startVerse}–${this.endVerse}`;
            }
        }
        else if (excludeVerses) {
            return `${this.startChapter}–${this.endChapter}`;
        }
        else {
            return `${this.startChapter}:${this.startVerse}–${this.endChapter}:${this.endVerse}`;
        }
    }
    outputWithoutChapters(excludeVerses) {
        if (this.isSingleVerse()) {
            return `${this.startVerse}`;
        }
        else if (excludeVerses) {
            return '';
        }
        else {
            return `${this.startVerse}–${this.endVerse}`;
        }
    }
    equals(other) {
        if (!(other instanceof Range))
            return false;
        return (this.startChapter === other.startChapter &&
            this.startVerse === other.startVerse &&
            this.endChapter === other.endChapter &&
            this.endVerse === other.endVerse);
    }
}
//# sourceMappingURL=range.js.map