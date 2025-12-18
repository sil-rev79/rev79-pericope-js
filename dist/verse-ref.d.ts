import { Book } from './book.js';
export declare class VerseRef {
    readonly book: Book;
    readonly chapter: number;
    readonly verse: number;
    constructor(book: Book | string, chapter: number | string, verse: number | string);
    toString(): string;
    /**
     * Converts the verse reference to a unique integer representation.
     * Format: BBBCCCVVV (Book number * 1,000,000 + Chapter * 1,000 + Verse)
     * This allows for easy comparison and range checking.
     */
    toInt(): number;
    isValid(): boolean;
    equals(other: any): boolean;
    /**
     * Compares this verse reference with another.
     * Returns -1 if this is before, 1 if after, and 0 if identical.
     * Priority: Book > Chapter > Verse.
     */
    compareTo(other: VerseRef): number;
    isBefore(other: VerseRef): boolean;
    isAfter(other: VerseRef): boolean;
    /**
     * Returns the next verse in the Bible.
     * Handles crossing chapter boundaries.
     * Returns undefined if this is the last verse of the book.
     */
    nextVerse(): VerseRef | undefined;
    /**
     * Returns the previous verse in the Bible.
     * Handles crossing chapter boundaries.
     * Returns undefined if this is the first verse of the book.
     */
    previousVerse(): VerseRef | undefined;
    private validateReference;
}
