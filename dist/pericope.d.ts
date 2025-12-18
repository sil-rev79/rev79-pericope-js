import { Book } from './book.js';
import { VerseRef } from './verse-ref.js';
import { VersificationSystem } from './versification.js';
export interface Range {
    startChapter: number;
    startVerse: number;
    endChapter: number;
    endVerse: number;
}
export declare class Pericope {
    readonly book: Book;
    readonly ranges: Range[];
    readonly system: VersificationSystem;
    constructor(referenceString: string, system?: VersificationSystem);
    static parse(text: string, system?: VersificationSystem): Pericope[];
    toString(format?: 'canonical' | 'full_name' | 'abbreviated'): string;
    /**
     * Converts the pericope into an array of individual VerseRef objects.
     */
    toArray(): VerseRef[];
    isValid(): boolean;
    isEmpty(): boolean;
    isSingleVerse(): boolean;
    isSingleChapter(): boolean;
    spansChapters(): boolean;
    verseCount(): number;
    chapterCount(): number;
    /**
     * Returns a sorted list of all chapter numbers included in this pericope.
     */
    chapterList(): number[];
    /**
     * Returns the first verse reference in the pericope.
     */
    firstVerse(): VerseRef | undefined;
    /**
     * Returns the last verse reference in the pericope.
     */
    lastVerse(): VerseRef | undefined;
    rangeCount(): number;
    versesInChapter(chapter: number): number;
    chaptersInRange(): Record<number, number[]>;
    density(): number;
    gaps(): VerseRef[];
    continuousRanges(): Pericope[];
    equals(other: any): boolean;
    intersects(other: Pericope): boolean;
    contains(other: Pericope): boolean;
    overlaps(other: Pericope): boolean;
    isAdjacentTo(other: Pericope): boolean;
    precedes(other: Pericope): boolean;
    follows(other: Pericope): boolean;
    union(other: Pericope): Pericope;
    intersection(other: Pericope): Pericope;
    subtract(other: Pericope): Pericope;
    complement(scope?: Pericope): Pericope;
    normalize(): Pericope;
    expand(versesBefore?: number, versesAfter?: number): Pericope;
    contract(versesFromStart?: number, versesFromEnd?: number): Pericope;
}
