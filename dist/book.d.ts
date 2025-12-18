import { BookInfo } from './book-data.js';
import { VersificationSystem } from './versification.js';
export declare class Book {
    readonly code: string;
    readonly number: number;
    readonly name: string;
    readonly testament: string;
    readonly chapterCount: number;
    readonly aliases: string[];
    constructor(bookInfo: BookInfo);
    static findByCode(code: string | null | undefined): Book | null;
    static findByNumber(number: number | null | undefined): Book | null;
    /**
     * Finds a book by its name or alias.
     * Performs an exact match first, then falls back to fuzzy matching.
     */
    static findByName(name: string | null | undefined): Book | null;
    static findByAlias(aliasName: string | null | undefined): Book | null;
    static allBooks(): Book[];
    static testamentBooks(testament: 'old' | 'new'): Book[];
    static normalizeName(input: string): string | null;
    /**
     * Performs a fuzzy string search to find a book by name.
     * Uses Levenshtein distance to find the best match within maxDistance.
     */
    private static findByFuzzyMatch;
    isValid(): boolean;
    isCanonical(): boolean;
    isOldTestament(): boolean;
    isNewTestament(): boolean;
    /**
     * Returns the number of verses in a given chapter.
     * Throws InvalidChapterError if the chapter is out of bounds for the book.
     */
    verseCount(chapter: number, system?: VersificationSystem): number;
    totalVerses(system?: VersificationSystem): number;
    isValidChapter(chapter: number, system?: VersificationSystem): boolean;
    isValidVerse(chapter: number, verse: number, system?: VersificationSystem): boolean;
    /**
     * Returns true if the input matches any of the book's aliases (case-insensitive).
     */
    matches(input: string | null | undefined): boolean;
    toString(): string;
    equals(other: any): boolean;
}
