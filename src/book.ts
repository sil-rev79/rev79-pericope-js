import { distance } from 'fastest-levenshtein';
import { BookInfo, BOOKS_BY_CODE, BOOKS_BY_NUMBER, ALIAS_TO_BOOK, ALL_BOOKS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from './book-data.js';
import { Versification, VersificationSystem } from './versification.js';
import { InvalidChapterError } from './errors.js';

export class Book {
    readonly code: string;
    readonly number: number;
    readonly name: string;
    readonly testament: string;
    readonly chapterCount: number;
    readonly aliases: string[];

    constructor(bookInfo: BookInfo) {
        this.code = bookInfo.code;
        this.number = bookInfo.number;
        this.name = bookInfo.name;
        this.testament = bookInfo.testament;
        this.chapterCount = bookInfo.chapterCount;
        this.aliases = [...bookInfo.aliases];
    }

    static findByCode(code: string | null | undefined): Book | null {
        if (!code) return null;
        const bookInfo = BOOKS_BY_CODE[code.toUpperCase()];
        return bookInfo ? new Book(bookInfo) : null;
    }

    static findByNumber(number: number | null | undefined): Book | null {
        if (number === null || number === undefined) return null;
        const bookInfo = BOOKS_BY_NUMBER[number];
        return bookInfo ? new Book(bookInfo) : null;
    }

    /**
     * Finds a book by its name or alias.
     * Performs an exact match first, then falls back to fuzzy matching.
     */
    static findByName(name: string | null | undefined): Book | null {
        if (!name) return null;
        const bookInfo = ALIAS_TO_BOOK[name.toLowerCase()];
        if (bookInfo) return new Book(bookInfo);

        return this.findByFuzzyMatch(name);
    }

    static findByAlias(aliasName: string | null | undefined): Book | null {
        return this.findByName(aliasName);
    }

    static allBooks(): Book[] {
        return ALL_BOOKS.map(info => new Book(info));
    }

    static testamentBooks(testament: 'old' | 'new'): Book[] {
        if (testament === 'old') {
            return OLD_TESTAMENT_BOOKS.map(info => new Book(info));
        } else if (testament === 'new') {
            return NEW_TESTAMENT_BOOKS.map(info => new Book(info));
        }
        return [];
    }

    static normalizeName(input: string): string | null {
        const book = this.findByName(input);
        return book ? book.code : null;
    }

    /**
     * Performs a fuzzy string search to find a book by name.
     * Uses Levenshtein distance to find the best match within maxDistance.
     */
    private static findByFuzzyMatch(name: string, maxDistance: number = 2): Book | null {
        if (name.length < 3) return null;

        let bestMatch: BookInfo | null = null;
        let bestDistance = maxDistance + 1;

        for (const [aliasName, bookInfo] of Object.entries(ALIAS_TO_BOOK)) {
            const d = distance(name.toLowerCase(), aliasName.toLowerCase());
            if (d <= maxDistance && d < bestDistance) {
                bestMatch = bookInfo;
                bestDistance = d;
            }
        }

        return bestMatch ? new Book(bestMatch) : null;
    }

    isValid(): boolean {
        return !!this.code && !!this.name;
    }

    isCanonical(): boolean {
        return this.testament === 'old' || this.testament === 'new';
    }

    isOldTestament(): boolean {
        return this.testament === 'old';
    }

    isNewTestament(): boolean {
        return this.testament === 'new';
    }

    /**
     * Returns the number of verses in a given chapter.
     * Throws InvalidChapterError if the chapter is out of bounds for the book.
     */
    verseCount(chapter: number, system: VersificationSystem = 'english'): number {
        const result = Versification.verseCount(this.code, chapter, system);
        if (result !== undefined) return result;
        throw new InvalidChapterError(this.code, chapter);
    }

    totalVerses(system: VersificationSystem = 'english'): number {
        const result = Versification.totalVerses(this.code, system);
        return result ?? 0;
    }

    isValidChapter(chapter: number, system: VersificationSystem = 'english'): boolean {
        return Versification.isValidChapter(this.code, chapter, system);
    }

    isValidVerse(chapter: number, verse: number, system: VersificationSystem = 'english'): boolean {
        return Versification.isValidVerse(this.code, chapter, verse, system);
    }

    /**
     * Returns true if the input matches any of the book's aliases (case-insensitive).
     */
    matches(input: string | null | undefined): boolean {
        if (!input) return false;
        const inputLower = input.toLowerCase();
        return this.aliases.some(alias => alias.toLowerCase() === inputLower);
    }

    toString(): string {
        return this.code;
    }

    equals(other: any): boolean {
        return other instanceof Book && this.code === other.code;
    }
}
