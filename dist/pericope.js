import { VerseRef } from './verse-ref.js';
import { TextProcessor } from './text-processor.js';
import { MathOperations } from './math-operations.js';
import { SetOperations } from './set-operations.js';
export class Pericope {
    book;
    ranges;
    system;
    constructor(referenceString, system = 'english') {
        this.system = system;
        const { book, ranges } = TextProcessor.parseReference(referenceString, system);
        this.book = book;
        this.ranges = ranges;
    }
    static parse(text, system = 'english') {
        return TextProcessor.parse(text, system);
    }
    toString(format = 'canonical') {
        return TextProcessor.formatPericope(this, format);
    }
    /**
     * Converts the pericope into an array of individual VerseRef objects.
     */
    toArray() {
        const verses = [];
        for (const range of this.ranges) {
            for (let ch = range.startChapter; ch <= range.endChapter; ch++) {
                const startV = ch === range.startChapter ? range.startVerse : 1;
                const endV = ch === range.endChapter ? range.endVerse : this.book.verseCount(ch, this.system);
                for (let v = startV; v <= endV; v++) {
                    verses.push(new VerseRef(this.book, ch, v));
                }
            }
        }
        return verses;
    }
    isValid() {
        return this.book.isValid() && this.ranges.length > 0;
    }
    isEmpty() {
        return this.ranges.length === 0;
    }
    isSingleVerse() {
        return this.ranges.length === 1 &&
            this.ranges[0].startChapter === this.ranges[0].endChapter &&
            this.ranges[0].startVerse === this.ranges[0].endVerse;
    }
    isSingleChapter() {
        return this.ranges.every(r => r.startChapter === r.endChapter);
    }
    spansChapters() {
        return this.ranges.some(r => r.startChapter !== r.endChapter);
    }
    verseCount() {
        return this.toArray().length;
    }
    chapterCount() {
        return this.chapterList().length;
    }
    /**
     * Returns a sorted list of all chapter numbers included in this pericope.
     */
    chapterList() {
        const chapters = new Set();
        for (const range of this.ranges) {
            for (let ch = range.startChapter; ch <= range.endChapter; ch++) {
                chapters.add(ch);
            }
        }
        return Array.from(chapters).sort((a, b) => a - b);
    }
    /**
     * Returns the first verse reference in the pericope.
     */
    firstVerse() {
        if (this.ranges.length === 0)
            return undefined;
        let min = this.ranges[0];
        for (const r of this.ranges) {
            if (r.startChapter < min.startChapter || (r.startChapter === min.startChapter && r.startVerse < min.startVerse)) {
                min = r;
            }
        }
        return new VerseRef(this.book, min.startChapter, min.startVerse);
    }
    /**
     * Returns the last verse reference in the pericope.
     */
    lastVerse() {
        if (this.ranges.length === 0)
            return undefined;
        let max = this.ranges[0];
        for (const r of this.ranges) {
            if (r.endChapter > max.endChapter || (r.endChapter === max.endChapter && r.endVerse > max.endVerse)) {
                max = r;
            }
        }
        return new VerseRef(this.book, max.endChapter, max.endVerse);
    }
    rangeCount() {
        return this.ranges.length;
    }
    // Math Operations
    versesInChapter(chapter) {
        return MathOperations.versesInChapter(this, chapter);
    }
    chaptersInRange() {
        return MathOperations.chaptersInRange(this);
    }
    density() {
        return MathOperations.density(this);
    }
    gaps() {
        return MathOperations.gaps(this);
    }
    continuousRanges() {
        return MathOperations.continuousRanges(this);
    }
    // Comparison
    equals(other) {
        if (!(other instanceof Pericope))
            return false;
        return this.book.equals(other.book) && JSON.stringify(this.ranges) === JSON.stringify(other.ranges);
    }
    intersects(other) {
        return MathOperations.intersects(this, other);
    }
    contains(other) {
        return MathOperations.contains(this, other);
    }
    overlaps(other) {
        return this.intersects(other);
    }
    isAdjacentTo(other) {
        return MathOperations.isAdjacentTo(this, other);
    }
    precedes(other) {
        return MathOperations.precedes(this, other);
    }
    follows(other) {
        return MathOperations.follows(this, other);
    }
    // Set Operations
    union(other) {
        return SetOperations.union(this, other);
    }
    intersection(other) {
        return SetOperations.intersection(this, other);
    }
    subtract(other) {
        return SetOperations.subtract(this, other);
    }
    complement(scope) {
        return SetOperations.complement(this, scope);
    }
    normalize() {
        return SetOperations.normalize(this);
    }
    expand(versesBefore = 0, versesAfter = 0) {
        return SetOperations.expand(this, versesBefore, versesAfter);
    }
    contract(versesFromStart = 0, versesFromEnd = 0) {
        return SetOperations.contract(this, versesFromStart, versesFromEnd);
    }
}
//# sourceMappingURL=pericope.js.map