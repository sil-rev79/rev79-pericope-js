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
    static normalize(...pericopes) {
        const grouped = new Map();
        for (const p of pericopes) {
            if (!grouped.has(p.book.code)) {
                grouped.set(p.book.code, []);
            }
            grouped.get(p.book.code).push(p);
        }
        const normal = [];
        for (const pericopeSet of grouped.values()) {
            const pericope = pericopeSet.pop();
            for (const p of pericopeSet) {
                pericope.addRanges(...p.ranges);
            }
            normal.push(pericope.normalize());
        }
        return normal.sort((a, b) => a.book.number - b.book.number);
    }
    toString(format = 'canonical') {
        if (this.ranges.length === 0)
            return '';
        const bookS = format === 'full_name' ? this.book.name : this.book.code;
        // if we are only dealing in full chapters, don't show verses except for canonical
        const excludeVerses = format !== 'canonical' &&
            this.ranges.every((r) => r.fullChaptersInBook(this.book, this.system));
        // for full book or single chapter book, don't show chapters if abbreviated
        const excludeChapters = format === 'abbreviated' &&
            (this.book.chapterCount === 1 ||
                this.ranges[0].fullBook(this.book, this.system));
        const rangesS = this.ranges
            .map((r) => r.toString(excludeChapters, excludeVerses))
            .filter((s) => s.length > 0)
            .join(',');
        return `${bookS} ${rangesS}`.trim();
    }
    /**
     * Converts the pericope into an array of individual VerseRef objects.
     */
    toArray() {
        const verses = [];
        for (const range of this.ranges) {
            if (range.isSingleVerse()) {
                verses.push(new VerseRef(this.book, range.startChapter, range.startVerse));
            }
            else {
                for (let ch = range.startChapter; ch <= range.endChapter; ch++) {
                    const startV = ch === range.startChapter ? range.startVerse : 1;
                    const endV = ch === range.endChapter
                        ? range.endVerse
                        : this.book.verseCount(ch, this.system);
                    for (let v = startV; v <= endV; v++) {
                        verses.push(new VerseRef(this.book, ch, v));
                    }
                }
            }
        }
        return verses;
    }
    isValid() {
        return (this.book.isValid() &&
            this.ranges.length > 0 &&
            this.ranges.every((r) => r.isValidInBook(this.book, this.system)));
    }
    isEmpty() {
        return this.ranges.length === 0;
    }
    isSingleVerse() {
        return this.ranges.length === 1 && this.ranges[0].isSingleVerse();
    }
    isSingleChapter() {
        return this.ranges.every((r) => r.isSingleChapter());
    }
    spansChapters() {
        return this.ranges.some((r) => r.spansChapters());
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
            if (r.startChapter < min.startChapter ||
                (r.startChapter === min.startChapter &&
                    r.startVerse < min.startVerse)) {
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
            if (r.endChapter > max.endChapter ||
                (r.endChapter === max.endChapter && r.endVerse > max.endVerse)) {
                max = r;
            }
        }
        return new VerseRef(this.book, max.endChapter, max.endVerse);
    }
    rangeCount() {
        return this.ranges.length;
    }
    addRanges(...additionalRanges) {
        this.ranges.push(...additionalRanges);
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
        return (this.book.equals(other.book) &&
            JSON.stringify(this.ranges) === JSON.stringify(other.ranges));
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