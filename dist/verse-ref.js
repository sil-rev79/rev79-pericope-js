import { Book } from './book.js';
import { InvalidBookError, InvalidChapterError, InvalidVerseError } from './errors.js';
export class VerseRef {
    book;
    chapter;
    verse;
    constructor(book, chapter, verse) {
        const foundBook = book instanceof Book ? book : Book.findByCode(book.toString());
        if (!foundBook) {
            throw new InvalidBookError(book.toString());
        }
        this.book = foundBook;
        this.chapter = typeof chapter === 'string' ? parseInt(chapter, 10) : chapter;
        this.verse = typeof verse === 'string' ? parseInt(verse, 10) : verse;
        if (this.chapter <= 0) {
            throw new InvalidChapterError(this.book.code, this.chapter);
        }
        if (this.verse <= 0) {
            throw new InvalidVerseError(this.book.code, this.chapter, this.verse);
        }
        this.validateReference();
    }
    toString() {
        return `${this.book.code} ${this.chapter}:${this.verse}`;
    }
    /**
     * Converts the verse reference to a unique integer representation.
     * Format: BBBCCCVVV (Book number * 1,000,000 + Chapter * 1,000 + Verse)
     * This allows for easy comparison and range checking.
     */
    toInt() {
        return (this.book.number * 1000000) + (this.chapter * 1000) + this.verse;
    }
    isValid() {
        if (!this.book.isValid())
            return false;
        if (this.chapter <= 0 || this.verse <= 0)
            return false;
        if (this.chapter > this.book.chapterCount)
            return false;
        try {
            return this.verse <= this.book.verseCount(this.chapter);
        }
        catch (e) {
            return false;
        }
    }
    equals(other) {
        if (!(other instanceof VerseRef))
            return false;
        return this.book.equals(other.book) && this.chapter === other.chapter && this.verse === other.verse;
    }
    /**
     * Compares this verse reference with another.
     * Returns -1 if this is before, 1 if after, and 0 if identical.
     * Priority: Book > Chapter > Verse.
     */
    compareTo(other) {
        if (this.book.number < other.book.number)
            return -1;
        if (this.book.number > other.book.number)
            return 1;
        if (this.chapter < other.chapter)
            return -1;
        if (this.chapter > other.chapter)
            return 1;
        if (this.verse < other.verse)
            return -1;
        if (this.verse > other.verse)
            return 1;
        return 0;
    }
    isBefore(other) {
        return this.compareTo(other) === -1;
    }
    isAfter(other) {
        return this.compareTo(other) === 1;
    }
    /**
     * Returns the next verse in the Bible.
     * Handles crossing chapter boundaries.
     * Returns undefined if this is the last verse of the book.
     */
    nextVerse() {
        const nextVerseNum = this.verse + 1;
        const maxVerse = this.book.verseCount(this.chapter);
        if (nextVerseNum <= maxVerse) {
            return new VerseRef(this.book, this.chapter, nextVerseNum);
        }
        else if (this.chapter < this.book.chapterCount) {
            return new VerseRef(this.book, this.chapter + 1, 1);
        }
        return undefined;
    }
    /**
     * Returns the previous verse in the Bible.
     * Handles crossing chapter boundaries.
     * Returns undefined if this is the first verse of the book.
     */
    previousVerse() {
        if (this.verse > 1) {
            return new VerseRef(this.book, this.chapter, this.verse - 1);
        }
        else if (this.chapter > 1) {
            const prevChapter = this.chapter - 1;
            const lastVerse = this.book.verseCount(prevChapter);
            return new VerseRef(this.book, prevChapter, lastVerse);
        }
        return undefined;
    }
    validateReference() {
        if (this.chapter > this.book.chapterCount) {
            throw new InvalidChapterError(this.book.code, this.chapter);
        }
        if (this.verse > this.book.verseCount(this.chapter)) {
            throw new InvalidVerseError(this.book.code, this.chapter, this.verse);
        }
    }
}
//# sourceMappingURL=verse-ref.js.map