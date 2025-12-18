import { distance } from 'fastest-levenshtein';
import { BOOKS_BY_CODE, BOOKS_BY_NUMBER, ALIAS_TO_BOOK, ALL_BOOKS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from './book-data.js';
import { Versification } from './versification.js';
import { InvalidChapterError } from './errors.js';
export class Book {
    code;
    number;
    name;
    testament;
    chapterCount;
    aliases;
    constructor(bookInfo) {
        this.code = bookInfo.code;
        this.number = bookInfo.number;
        this.name = bookInfo.name;
        this.testament = bookInfo.testament;
        this.chapterCount = bookInfo.chapterCount;
        this.aliases = [...bookInfo.aliases];
    }
    static findByCode(code) {
        if (!code)
            return null;
        const bookInfo = BOOKS_BY_CODE[code.toUpperCase()];
        return bookInfo ? new Book(bookInfo) : null;
    }
    static findByNumber(number) {
        if (number === null || number === undefined)
            return null;
        const bookInfo = BOOKS_BY_NUMBER[number];
        return bookInfo ? new Book(bookInfo) : null;
    }
    /**
     * Finds a book by its name or alias.
     * Performs an exact match first, then falls back to fuzzy matching.
     */
    static findByName(name) {
        if (!name)
            return null;
        const bookInfo = ALIAS_TO_BOOK[name.toLowerCase()];
        if (bookInfo)
            return new Book(bookInfo);
        return this.findByFuzzyMatch(name);
    }
    static findByAlias(aliasName) {
        return this.findByName(aliasName);
    }
    static allBooks() {
        return ALL_BOOKS.map(info => new Book(info));
    }
    static testamentBooks(testament) {
        if (testament === 'old') {
            return OLD_TESTAMENT_BOOKS.map(info => new Book(info));
        }
        else if (testament === 'new') {
            return NEW_TESTAMENT_BOOKS.map(info => new Book(info));
        }
        return [];
    }
    static normalizeName(input) {
        const book = this.findByName(input);
        return book ? book.code : null;
    }
    /**
     * Performs a fuzzy string search to find a book by name.
     * Uses Levenshtein distance to find the best match within maxDistance.
     */
    static findByFuzzyMatch(name, maxDistance = 2) {
        if (name.length < 3)
            return null;
        let bestMatch = null;
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
    isValid() {
        return !!this.code && !!this.name;
    }
    isCanonical() {
        return this.testament === 'old' || this.testament === 'new';
    }
    isOldTestament() {
        return this.testament === 'old';
    }
    isNewTestament() {
        return this.testament === 'new';
    }
    /**
     * Returns the number of verses in a given chapter.
     * Throws InvalidChapterError if the chapter is out of bounds for the book.
     */
    verseCount(chapter, system = 'english') {
        const result = Versification.verseCount(this.code, chapter, system);
        if (result !== undefined)
            return result;
        throw new InvalidChapterError(this.code, chapter);
    }
    totalVerses(system = 'english') {
        const result = Versification.totalVerses(this.code, system);
        return result ?? 0;
    }
    isValidChapter(chapter, system = 'english') {
        return Versification.isValidChapter(this.code, chapter, system);
    }
    isValidVerse(chapter, verse, system = 'english') {
        return Versification.isValidVerse(this.code, chapter, verse, system);
    }
    /**
     * Returns true if the input matches any of the book's aliases (case-insensitive).
     */
    matches(input) {
        if (!input)
            return false;
        const inputLower = input.toLowerCase();
        return this.aliases.some(alias => alias.toLowerCase() === inputLower);
    }
    toString() {
        return this.code;
    }
    equals(other) {
        return other instanceof Book && this.code === other.code;
    }
}
//# sourceMappingURL=book.js.map