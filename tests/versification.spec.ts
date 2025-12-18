import { describe, it, expect } from 'vitest';
import { Versification } from '../src/versification.js';

describe('Versification', () => {
    describe('verseCount', () => {
        it('returns correct verse counts for Genesis', () => {
            expect(Versification.verseCount('GEN', 1)).toBe(31);
            expect(Versification.verseCount('GEN', 2)).toBe(25);
            expect(Versification.verseCount('GEN', 50)).toBe(26);
        });

        it('returns correct verse counts for Matthew', () => {
            expect(Versification.verseCount('MAT', 1)).toBe(25);
            expect(Versification.verseCount('MAT', 5)).toBe(48);
            expect(Versification.verseCount('MAT', 28)).toBe(20);
        });

        it('returns undefined for invalid inputs', () => {
            expect(Versification.verseCount('INVALID', 1)).toBeUndefined();
            expect(Versification.verseCount('GEN', 0)).toBeUndefined();
            expect(Versification.verseCount('GEN', 51)).toBeUndefined();
        });
    });

    describe('totalVerses', () => {
        it('returns correct total verse counts', () => {
            expect(Versification.totalVerses('GEN')).toBe(1533);
            expect(Versification.totalVerses('MAT')).toBe(1071);
            expect(Versification.totalVerses('OBA')).toBe(21);
        });

        it('returns undefined for invalid book codes', () => {
            expect(Versification.totalVerses('INVALID')).toBeUndefined();
        });
    });

    describe('isValidChapter', () => {
        it('returns true for valid chapters', () => {
            expect(Versification.isValidChapter('GEN', 1)).toBe(true);
            expect(Versification.isValidChapter('GEN', 50)).toBe(true);
        });

        it('returns false for invalid chapters', () => {
            expect(Versification.isValidChapter('GEN', 0)).toBe(false);
            expect(Versification.isValidChapter('GEN', 51)).toBe(false);
        });
    });

    describe('isValidVerse', () => {
        it('returns true for valid verses', () => {
            expect(Versification.isValidVerse('GEN', 1, 1)).toBe(true);
            expect(Versification.isValidVerse('GEN', 1, 31)).toBe(true);
        });

        it('returns false for invalid verses', () => {
            expect(Versification.isValidVerse('GEN', 1, 0)).toBe(false);
            expect(Versification.isValidVerse('GEN', 1, 32)).toBe(false);
        });
    });

    describe('data integrity', () => {
        it('has data for all 66 canonical books', () => {
            const allCodes = [
                'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
                'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
                'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
                '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
            ];
            for (const code of allCodes) {
                expect(Versification.bookChapters(code).length).toBeGreaterThan(0);
            }
        });

        it('has expected chapter counts', () => {
            expect(Versification.bookChapters('GEN').length).toBe(50);
            expect(Versification.bookChapters('PSA').length).toBe(150);
            expect(Versification.bookChapters('MAT').length).toBe(28);
        });
    });
});
