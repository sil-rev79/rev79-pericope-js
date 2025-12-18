import { describe, it, expect } from 'vitest';
import { Book } from '../src/book.js';
import { VerseRef } from '../src/verse-ref.js';
import { InvalidBookError, InvalidChapterError, InvalidVerseError } from '../src/errors.js';

describe('VerseRef', () => {
    const genesis = Book.findByCode('GEN')!;
    const matthew = Book.findByCode('MAT')!;

    describe('constructor', () => {
        it('creates a verse reference with book object', () => {
            const verseRef = new VerseRef(genesis, 1, 1);
            expect(verseRef.book).toBe(genesis);
            expect(verseRef.chapter).toBe(1);
            expect(verseRef.verse).toBe(1);
        });

        it('creates a verse reference with book code string', () => {
            const verseRef = new VerseRef('GEN', 1, 1);
            expect(verseRef.book.code).toBe('GEN');
            expect(verseRef.chapter).toBe(1);
            expect(verseRef.verse).toBe(1);
        });

        it('converts string numbers to integers', () => {
            const verseRef = new VerseRef(genesis, '1', '1');
            expect(verseRef.chapter).toBe(1);
            expect(verseRef.verse).toBe(1);
        });

        it('raises InvalidBookError for invalid book', () => {
            expect(() => new VerseRef('INVALID', 1, 1)).toThrow(InvalidBookError);
        });

        it('raises InvalidChapterError for invalid chapter', () => {
            expect(() => new VerseRef(genesis, 0, 1)).toThrow(InvalidChapterError);
            expect(() => new VerseRef(genesis, -1, 1)).toThrow(InvalidChapterError);
        });

        it('raises InvalidVerseError for invalid verse', () => {
            expect(() => new VerseRef(genesis, 1, 0)).toThrow(InvalidVerseError);
            expect(() => new VerseRef(genesis, 1, -1)).toThrow(InvalidVerseError);
        });
    });

    describe('toString', () => {
        it('returns string representation', () => {
            const verseRef = new VerseRef(genesis, 1, 1);
            expect(verseRef.toString()).toBe('GEN 1:1');
        });

        it('handles different books', () => {
            const verseRef = new VerseRef(matthew, 5, 3);
            expect(verseRef.toString()).toBe('MAT 5:3');
        });
    });

    describe('toInt', () => {
        it('returns BBBCCCVVV format', () => {
            const verseRef = new VerseRef(genesis, 1, 1);
            const expected = (1 * 1000000) + (1 * 1000) + 1; // 1001001
            expect(verseRef.toInt()).toBe(expected);
        });

        it('handles different values', () => {
            const verseRef = new VerseRef(matthew, 5, 3);
            const expected = (40 * 1000000) + (5 * 1000) + 3; // 40005003
            expect(verseRef.toInt()).toBe(expected);
        });
    });

    describe('equals', () => {
        it('returns true for identical references', () => {
            const verseRef1 = new VerseRef(genesis, 1, 1);
            const verseRef2 = new VerseRef(genesis, 1, 1);
            expect(verseRef1.equals(verseRef2)).toBe(true);
        });

        it('returns false for different references', () => {
            const verseRef1 = new VerseRef(genesis, 1, 1);
            const verseRef2 = new VerseRef(genesis, 1, 2);
            expect(verseRef1.equals(verseRef2)).toBe(false);
        });

        it('returns false for different books', () => {
            const verseRef1 = new VerseRef(genesis, 1, 1);
            const verseRef2 = new VerseRef(matthew, 1, 1);
            expect(verseRef1.equals(verseRef2)).toBe(false);
        });
    });

    describe('compareTo', () => {
        const gen_1_1 = new VerseRef(genesis, 1, 1);
        const gen_1_2 = new VerseRef(genesis, 1, 2);
        const gen_2_1 = new VerseRef(genesis, 2, 1);
        const mat_1_1 = new VerseRef(matthew, 1, 1);

        it('compares by book first', () => {
            expect(gen_1_1.compareTo(mat_1_1)).toBe(-1);
            expect(mat_1_1.compareTo(gen_1_1)).toBe(1);
        });

        it('compares by chapter within same book', () => {
            expect(gen_1_1.compareTo(gen_2_1)).toBe(-1);
            expect(gen_2_1.compareTo(gen_1_1)).toBe(1);
        });

        it('compares by verse within same chapter', () => {
            expect(gen_1_1.compareTo(gen_1_2)).toBe(-1);
            expect(gen_1_2.compareTo(gen_1_1)).toBe(1);
        });

        it('returns 0 for identical references', () => {
            const verseRef1 = new VerseRef(genesis, 1, 1);
            const verseRef2 = new VerseRef(genesis, 1, 1);
            expect(verseRef1.compareTo(verseRef2)).toBe(0);
        });
    });

    describe('isBefore/isAfter', () => {
        it('returns true when this verse comes before another', () => {
            const verseRef1 = new VerseRef(genesis, 1, 1);
            const verseRef2 = new VerseRef(genesis, 1, 2);
            expect(verseRef1.isBefore(verseRef2)).toBe(true);
            expect(verseRef2.isBefore(verseRef1)).toBe(false);
        });

        it('returns true when this verse comes after another', () => {
            const verseRef1 = new VerseRef(genesis, 1, 1);
            const verseRef2 = new VerseRef(genesis, 1, 2);
            expect(verseRef2.isAfter(verseRef1)).toBe(true);
            expect(verseRef1.isAfter(verseRef2)).toBe(false);
        });
    });

    describe('nextVerse', () => {
        it('returns next verse in same chapter', () => {
            const verseRef = new VerseRef(genesis, 1, 1);
            const nextVerse = verseRef.nextVerse();
            expect(nextVerse?.chapter).toBe(1);
            expect(nextVerse?.verse).toBe(2);
        });

        it('returns first verse of next chapter when at end of chapter', () => {
            const verseRef = new VerseRef(genesis, 1, 31);
            const nextVerse = verseRef.nextVerse();
            expect(nextVerse?.chapter).toBe(2);
            expect(nextVerse?.verse).toBe(1);
        });

        it('returns undefined when at end of book', () => {
            const verseRef = new VerseRef(genesis, 50, 26);
            const nextVerse = verseRef.nextVerse();
            expect(nextVerse).toBeUndefined();
        });
    });

    describe('previousVerse', () => {
        it('returns previous verse in same chapter', () => {
            const verseRef = new VerseRef(genesis, 1, 2);
            const prevVerse = verseRef.previousVerse();
            expect(prevVerse?.chapter).toBe(1);
            expect(prevVerse?.verse).toBe(1);
        });

        it('returns last verse of previous chapter when at beginning of chapter', () => {
            const verseRef = new VerseRef(genesis, 2, 1);
            const prevVerse = verseRef.previousVerse();
            expect(prevVerse?.chapter).toBe(1);
            expect(prevVerse?.verse).toBe(31);
        });

        it('returns undefined when at beginning of book', () => {
            const verseRef = new VerseRef(genesis, 1, 1);
            const prevVerse = verseRef.previousVerse();
            expect(prevVerse).toBeUndefined();
        });
    });
});
