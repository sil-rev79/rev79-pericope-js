import { Book } from './book.js';
import { VerseRef } from './verse-ref.js';
import { VersificationSystem } from './versification.js';

export class Range {
    readonly startChapter: number;
    readonly startVerse: number;
    readonly endChapter: number;
    readonly endVerse: number;

    constructor(
        startChapter: number,
        startVerse: number,
        endChapter: number,
        endVerse: number,
    ) {
        this.startChapter = startChapter;
        this.startVerse = startVerse;
        this.endChapter = endChapter;
        this.endVerse = endVerse;
    }

    static fromVerseRefs(startVerse: VerseRef, endVerse: VerseRef): Range {
        return new Range(
            startVerse.chapter,
            startVerse.verse,
            endVerse.chapter,
            endVerse.verse,
        );
    }

    isSingleVerse(): boolean {
        return (
            this.startChapter === this.endChapter &&
            this.startVerse === this.endVerse
        );
    }

    isSingleChapter(): boolean {
        return this.startChapter === this.endChapter;
    }

    spansChapters(): boolean {
        return this.startChapter !== this.endChapter;
    }

    isValidInBook(
        book: Book,
        system: VersificationSystem = 'english',
    ): boolean {
        return (
            this.startChapter > 0 &&
            this.endChapter > 0 &&
            this.startVerse > 0 &&
            this.endVerse > 0 &&
            this.startChapter <= book.chapterCount &&
            this.endChapter <= book.chapterCount
        );
    }

    fullChaptersInBook(
        book: Book,
        system: VersificationSystem = 'english',
    ): boolean {
        return (
            this.startVerse === 1 &&
            this.endVerse === book.verseCount(this.endChapter, system)
        );
    }

    fullBook(book: Book, system: VersificationSystem = 'english'): boolean {
        return (
            this.fullChaptersInBook(book, system) &&
            this.startChapter === 1 &&
            this.endChapter === book.chapterCount
        );
    }

    toString(
        excludeChapters: boolean = false,
        excludeVerses: boolean = false,
    ): string {
        return excludeChapters
            ? this.outputWithoutChapters(excludeVerses)
            : this.outputWithChapters(excludeVerses);
    }

    private outputWithChapters(excludeVerses: boolean): string {
        if (this.isSingleVerse()) {
            return `${this.startChapter}:${this.startVerse}`;
        } else if (this.isSingleChapter()) {
            if (excludeVerses) {
                return `${this.startChapter}`;
            } else {
                return `${this.startChapter}:${this.startVerse}–${this.endVerse}`;
            }
        } else if (excludeVerses) {
            return `${this.startChapter}–${this.endChapter}`;
        } else {
            return `${this.startChapter}:${this.startVerse}–${this.endChapter}:${this.endVerse}`;
        }
    }

    private outputWithoutChapters(excludeVerses: boolean): string {
        if (this.isSingleVerse()) {
            return `${this.startVerse}`;
        } else if (excludeVerses) {
            return '';
        } else {
            return `${this.startVerse}–${this.endVerse}`;
        }
    }

    equals(other: any): boolean {
        if (!(other instanceof Range)) return false;

        return (
            this.startChapter === other.startChapter &&
            this.startVerse === other.startVerse &&
            this.endChapter === other.endChapter &&
            this.endVerse === other.endVerse
        );
    }
}
