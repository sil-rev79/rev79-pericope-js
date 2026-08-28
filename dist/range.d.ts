import { Book } from './book.js';
import { VerseRef } from './verse-ref.js';
import { VersificationSystem } from './versification.js';
export declare class Range {
    readonly startChapter: number;
    readonly startVerse: number;
    readonly endChapter: number;
    readonly endVerse: number;
    constructor(startChapter: number, startVerse: number, endChapter: number, endVerse: number);
    static fromVerseRefs(startVerse: VerseRef, endVerse: VerseRef): Range;
    isSingleVerse(): boolean;
    isSingleChapter(): boolean;
    spansChapters(): boolean;
    isValidInBook(book: Book, system?: VersificationSystem): boolean;
    fullChaptersInBook(book: Book, system?: VersificationSystem): boolean;
    fullBook(book: Book, system?: VersificationSystem): boolean;
    toString(excludeChapters?: boolean, excludeVerses?: boolean): string;
    private outputWithChapters;
    private outputWithoutChapters;
    equals(other: any): boolean;
}
