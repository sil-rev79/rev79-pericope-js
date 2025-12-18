import { Book } from './book.js';
import { VerseRef } from './verse-ref.js';
import { VersificationSystem } from './versification.js';
import { TextProcessor } from './text-processor.js';
import { MathOperations } from './math-operations.js';
import { SetOperations } from './set-operations.js';

export interface Range {
    startChapter: number;
    startVerse: number;
    endChapter: number;
    endVerse: number;
}

export class Pericope {
    readonly book: Book;
    readonly ranges: Range[];
    readonly system: VersificationSystem;

    constructor(referenceString: string, system: VersificationSystem = 'english') {
        this.system = system;
        const { book, ranges } = TextProcessor.parseReference(referenceString, system);
        this.book = book;
        this.ranges = ranges;
    }

    static parse(text: string, system: VersificationSystem = 'english'): Pericope[] {
        return TextProcessor.parse(text, system);
    }

    toString(format: 'canonical' | 'full_name' | 'abbreviated' = 'canonical'): string {
        return TextProcessor.formatPericope(this, format);
    }

    /**
     * Converts the pericope into an array of individual VerseRef objects.
     */
    toArray(): VerseRef[] {
        const verses: VerseRef[] = [];
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

    isValid(): boolean {
        return this.book.isValid() && this.ranges.length > 0;
    }

    isEmpty(): boolean {
        return this.ranges.length === 0;
    }

    isSingleVerse(): boolean {
        return this.ranges.length === 1 &&
            this.ranges[0].startChapter === this.ranges[0].endChapter &&
            this.ranges[0].startVerse === this.ranges[0].endVerse;
    }

    isSingleChapter(): boolean {
        return this.ranges.every(r => r.startChapter === r.endChapter);
    }

    spansChapters(): boolean {
        return this.ranges.some(r => r.startChapter !== r.endChapter);
    }

    verseCount(): number {
        return this.toArray().length;
    }

    chapterCount(): number {
        return this.chapterList().length;
    }

    /**
     * Returns a sorted list of all chapter numbers included in this pericope.
     */
    chapterList(): number[] {
        const chapters = new Set<number>();
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
    firstVerse(): VerseRef | undefined {
        if (this.ranges.length === 0) return undefined;
        let min: Range = this.ranges[0];
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
    lastVerse(): VerseRef | undefined {
        if (this.ranges.length === 0) return undefined;
        let max: Range = this.ranges[0];
        for (const r of this.ranges) {
            if (r.endChapter > max.endChapter || (r.endChapter === max.endChapter && r.endVerse > max.endVerse)) {
                max = r;
            }
        }
        return new VerseRef(this.book, max.endChapter, max.endVerse);
    }

    rangeCount(): number {
        return this.ranges.length;
    }

    // Math Operations
    versesInChapter(chapter: number): number {
        return MathOperations.versesInChapter(this, chapter);
    }

    chaptersInRange(): Record<number, number[]> {
        return MathOperations.chaptersInRange(this);
    }

    density(): number {
        return MathOperations.density(this);
    }

    gaps(): VerseRef[] {
        return MathOperations.gaps(this);
    }

    continuousRanges(): Pericope[] {
        return MathOperations.continuousRanges(this);
    }

    // Comparison
    equals(other: any): boolean {
        if (!(other instanceof Pericope)) return false;
        return this.book.equals(other.book) && JSON.stringify(this.ranges) === JSON.stringify(other.ranges);
    }

    intersects(other: Pericope): boolean {
        return MathOperations.intersects(this, other);
    }

    contains(other: Pericope): boolean {
        return MathOperations.contains(this, other);
    }

    overlaps(other: Pericope): boolean {
        return this.intersects(other);
    }

    isAdjacentTo(other: Pericope): boolean {
        return MathOperations.isAdjacentTo(this, other);
    }

    precedes(other: Pericope): boolean {
        return MathOperations.precedes(this, other);
    }

    follows(other: Pericope): boolean {
        return MathOperations.follows(this, other);
    }

    // Set Operations
    union(other: Pericope): Pericope {
        return SetOperations.union(this, other);
    }

    intersection(other: Pericope): Pericope {
        return SetOperations.intersection(this, other);
    }

    subtract(other: Pericope): Pericope {
        return SetOperations.subtract(this, other);
    }

    complement(scope?: Pericope): Pericope {
        return SetOperations.complement(this, scope);
    }

    normalize(): Pericope {
        return SetOperations.normalize(this);
    }

    expand(versesBefore: number = 0, versesAfter: number = 0): Pericope {
        return SetOperations.expand(this, versesBefore, versesAfter);
    }

    contract(versesFromStart: number = 0, versesFromEnd: number = 0): Pericope {
        return SetOperations.contract(this, versesFromStart, versesFromEnd);
    }
}
