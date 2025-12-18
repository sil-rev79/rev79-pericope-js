import { describe, it, expect } from 'vitest';
import { Book } from '../src/book.js';
import { InvalidChapterError } from '../src/errors.js';

describe('Book', () => {
    describe('findByCode', () => {
        it('finds book by exact Paratext code', () => {
            const book = Book.findByCode('GEN');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('GEN');
            expect(book?.name).toBe('Genesis');
        });

        it('is case insensitive', () => {
            const book = Book.findByCode('gen');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('GEN');
        });

        it('returns null for invalid codes', () => {
            expect(Book.findByCode('INVALID')).toBeNull();
            expect(Book.findByCode(null)).toBeNull();
            expect(Book.findByCode('')).toBeNull();
        });

        it('finds New Testament books', () => {
            const book = Book.findByCode('MAT');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('MAT');
            expect(book?.name).toBe('Matthew');
            expect(book?.testament).toBe('new');
        });
    });

    describe('findByNumber', () => {
        it('finds book by number', () => {
            const book = Book.findByNumber(1);
            expect(book).not.toBeNull();
            expect(book?.code).toBe('GEN');
            expect(book?.number).toBe(1);
        });

        it('finds New Testament books by number', () => {
            const book = Book.findByNumber(40);
            expect(book).not.toBeNull();
            expect(book?.code).toBe('MAT');
            expect(book?.number).toBe(40);
        });

        it('returns null for invalid numbers', () => {
            expect(Book.findByNumber(0)).toBeNull();
            expect(Book.findByNumber(100)).toBeNull();
            expect(Book.findByNumber(null)).toBeNull();
        });
    });

    describe('findByName', () => {
        it('finds book by full name', () => {
            const book = Book.findByName('Genesis');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('GEN');
        });

        it('finds book by common abbreviation', () => {
            const book = Book.findByName('Gen');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('GEN');
        });

        it('is case insensitive', () => {
            const book = Book.findByName('genesis');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('GEN');
        });

        it('finds book by Paratext code', () => {
            const book = Book.findByName('GEN');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('GEN');
        });

        it('handles complex book names', () => {
            const book = Book.findByName('1 Corinthians');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('1CO');
        });

        it('handles alternative spellings', () => {
            const book = Book.findByName('Mathew'); // Fuzzy match
            expect(book).not.toBeNull();
            expect(book?.code).toBe('MAT');
        });

        it('handles numeric variations', () => {
            const book = Book.findByName('First Corinthians');
            expect(book).not.toBeNull();
            expect(book?.code).toBe('1CO');
        });

        it('returns null for invalid names', () => {
            expect(Book.findByName('Invalid Book')).toBeNull();
            expect(Book.findByName(null)).toBeNull();
            expect(Book.findByName('')).toBeNull();
        });
    });

    describe('allBooks', () => {
        it('returns all 66 canonical books', () => {
            const books = Book.allBooks();
            expect(books.length).toBe(66);
            expect(books[0].code).toBe('GEN');
            expect(books[65].code).toBe('REV');
        });
    });

    describe('instance methods', () => {
        const genesis = Book.findByCode('GEN')!;
        const matthew = Book.findByCode('MAT')!;

        it('validates canonical books', () => {
            expect(genesis.isCanonical()).toBe(true);
            expect(matthew.isCanonical()).toBe(true);
        });

        it('identifies testaments correctly', () => {
            expect(genesis.isOldTestament()).toBe(true);
            expect(genesis.isNewTestament()).toBe(false);
            expect(matthew.isOldTestament()).toBe(false);
            expect(matthew.isNewTestament()).toBe(true);
        });

        it('matches against aliases', () => {
            expect(genesis.matches('Genesis')).toBe(true);
            expect(genesis.matches('Gen')).toBe(true);
            expect(genesis.matches('GEN')).toBe(true);
            expect(genesis.matches('genesis')).toBe(true);
            expect(genesis.matches('Matthew')).toBe(false);
        });

        it('returns verse count for a chapter', () => {
            expect(genesis.verseCount(1)).toBe(31);
            expect(genesis.verseCount(2)).toBe(25);
            expect(matthew.verseCount(1)).toBe(25);
        });

        it('raises error for invalid chapter', () => {
            expect(() => genesis.verseCount(999)).toThrow(InvalidChapterError);
        });

        it('converts to string', () => {
            expect(genesis.toString()).toBe('GEN');
        });

        it('checks equality', () => {
            const gen2 = Book.findByName('Genesis');
            expect(genesis.equals(gen2)).toBe(true);
            expect(genesis.equals(matthew)).toBe(false);
        });
    });
});
