import { describe, it, expect } from 'vitest';
import { Pericope } from '../src/pericope.js';
import { VerseRef } from '../src/verse-ref.js';
import { Range } from '../src/range.js';
import {
    ParseError,
    InvalidBookError,
    InvalidChapterError,
    InvalidVerseError,
    InvalidRangeError,
} from '../src/errors.js';

describe('Pericope', () => {
    describe('constructor', () => {
        it('parses a simple verse reference', () => {
            const pericope = new Pericope('GEN 1:1');
            expect(pericope.book.code).toBe('GEN');
            expect(pericope.toString()).toBe('GEN 1:1');
        });

        it('parses a single verse reference in a single-chapter book', () => {
            const pericope = new Pericope('JUD 20');
            expect(pericope.toString()).toBe('JUD 1:20');
        });

        it('parses a verse range', () => {
            const pericope = new Pericope('GEN 1:1-3');
            expect(pericope.toString()).toBe('GEN 1:1–3');
        });

        it('parses a chapterless range for a single-chapter book', () => {
            const pericope = new Pericope('JUD 22-24');
            expect(pericope.rangeCount()).toBe(1);
            const range = pericope.ranges[0];

            expect(range.startChapter).toBe(1);
            expect(range.startVerse).toBe(22);
            expect(range.endChapter).toBe(1);
            expect(range.endVerse).toBe(24);
        });

        it('parses a cross-chapter range', () => {
            const pericope = new Pericope('GEN 1:1-2:3');
            expect(pericope.toString()).toBe('GEN 1:1–2:3');
        });

        it('parses multiple ranges with multiple delimiters', () => {
            const pericope = new Pericope('GEN 1:1,3;5.9,10-12;15–17');
            expect(pericope.rangeCount()).toBe(5);
        });

        it('raises ParseError for empty reference', () => {
            expect(() => new Pericope('')).toThrow(ParseError);
        });

        it('raises InvalidBookError for invalid book', () => {
            expect(() => new Pericope('INVALID 1:1')).toThrow(InvalidBookError);
        });

        it('raises InvalidChapterError for invalid chapter', () => {
            expect(() => new Pericope('GEN 999:1')).toThrow(
                InvalidChapterError,
            );
        });

        it('raises InvalidVerseError for invalid verse', () => {
            expect(() => new Pericope('GEN 1:999')).toThrow(InvalidVerseError);
        });

        it('raises InvalidVerseError for invalid verse in single chapter book', () => {
            expect(() => new Pericope('JUD 999')).toThrow(InvalidVerseError);
        });

        it('raises error for range with start chapter after end chapter', () => {
            expect(() => new Pericope('GEN 2:3 - 1:8')).toThrow(
                InvalidRangeError,
            );
        });

        it('raises error for range with start verse after end verse in one chapter', () => {
            expect(() => new Pericope('GEN 2:8 - 2:3')).toThrow(
                InvalidRangeError,
            );
        });

        it('handles book names with flexible matching', () => {
            const pericope = new Pericope('Genesis 1:1');
            expect(pericope.book.code).toBe('GEN');
        });

        it('defaults to the whole book if no range provided', () => {
            const pericope = new Pericope('GEN');
            expect(pericope.toString()).toBe('GEN 1:1–50:26');
        });

        it('parses complex ranges including whole chapters', () => {
            const pericope = new Pericope('Genesis 1, 5-7, 11:1-3, 5-7');
            expect(pericope.rangeCount()).toBe(4);

            expect(pericope.ranges).toEqual([
                // 1 -> whole of chapter 1
                new Range(1, 1, 1, 31),
                // 5-7 -> all of chapters 5 through 7
                new Range(5, 1, 7, 24),
                // 11:1-3 -> verses 1-3 of chapter 11
                new Range(11, 1, 11, 3),
                // 5-7 -> verses 5-7 of chapter 11
                new Range(11, 5, 11, 7),
            ]);
        });
    });

    describe('parse', () => {
        it('extracts pericopes from text', () => {
            const text = 'See GEN 1:1 and MAT 5:3-12 for examples';
            const pericopes = Pericope.parse(text);
            expect(pericopes.length).toBe(2);
            expect(pericopes[0].toString()).toBe('GEN 1:1');
            expect(pericopes[1].toString()).toBe('MAT 5:3–12');
        });
    });

    describe('toArray', () => {
        it('returns array of VerseRef objects for single verse', () => {
            const pericope = new Pericope('GEN 1:1');
            const verses = pericope.toArray();
            expect(verses.length).toBe(1);
            expect(verses[0]).toBeInstanceOf(VerseRef);
            expect(verses[0].toString()).toBe('GEN 1:1');
        });

        it('returns array of VerseRef objects for verse range', () => {
            const pericope = new Pericope('GEN 1:1-3');
            const verses = pericope.toArray();
            expect(verses.length).toBe(3);
            expect(verses.map((v) => v.toString())).toEqual([
                'GEN 1:1',
                'GEN 1:2',
                'GEN 1:3',
            ]);
        });
    });

    describe('validation and counting', () => {
        const p = new Pericope('GEN 1:1-3');

        it('checks if empty', () => {
            expect(p.isEmpty()).toBe(false);
        });

        it('checks if single verse', () => {
            expect(p.isSingleVerse()).toBe(false);
            expect(new Pericope('GEN 1:1').isSingleVerse()).toBe(true);
        });

        it('verseCount returns correct count', () => {
            expect(p.verseCount()).toBe(3);
        });

        it('chapterList returns chapters', () => {
            const p2 = new Pericope('GEN 1:1-3:1');
            expect(p2.chapterList()).toEqual([1, 2, 3]);
        });
    });

    describe('advanced math', () => {
        it('calculates versesInChapter', () => {
            const p = new Pericope('GEN 1:30-2:5');
            expect(p.versesInChapter(1)).toBe(2); // 30, 31
            expect(p.versesInChapter(2)).toBe(5); // 1-5
        });

        it('calculates density', () => {
            const p = new Pericope('GEN 1:1-10');
            // Genesis 1 has 31 verses. 10/31 is approx 0.322
            expect(p.density()).toBeCloseTo(10 / 31, 2);
        });

        it('identifies gaps', () => {
            const p = new Pericope('GEN 1:1,3,5');
            const gaps = p.gaps();
            expect(gaps.map((v) => v.toString())).toEqual([
                'GEN 1:2',
                'GEN 1:4',
            ]);
        });

        it('breaks into continuous ranges', () => {
            const p = new Pericope('GEN 1:1-3,5-7,10');
            const ranges = p.continuousRanges();
            expect(ranges.length).toBe(3);
            expect(ranges.map((r) => r.toString())).toEqual([
                'GEN 1:1–3',
                'GEN 1:5–7',
                'GEN 1:10',
            ]);
        });
    });

    describe('comparison', () => {
        const p1 = new Pericope('GEN 1:1-10');
        const p2 = new Pericope('GEN 1:5-15');
        const p3 = new Pericope('GEN 1:11-20');

        it('intersects correctly', () => {
            expect(p1.intersects(p2)).toBe(true);
            expect(p1.intersects(p3)).toBe(false);
        });

        it('contains correctly', () => {
            const inner = new Pericope('GEN 1:3-7');
            expect(p1.contains(inner)).toBe(true);
            expect(inner.contains(p1)).toBe(false);
        });

        it('checks adjacency', () => {
            const p1 = new Pericope('GEN 1:1-5');
            const p2 = new Pericope('GEN 1:6-10');
            expect(p1.isAdjacentTo(p2)).toBe(true);
        });
    });

    describe('set operations', () => {
        it('union combines ranges', () => {
            const p1 = new Pericope('GEN 1:1-10');
            const p2 = new Pericope('GEN 1:5-15');
            expect(p1.union(p2).toString()).toBe('GEN 1:1–15');
        });

        it('intersection finds overlap', () => {
            const p1 = new Pericope('GEN 1:1-10');
            const p2 = new Pericope('GEN 1:5-15');
            expect(p1.intersection(p2).toString()).toBe('GEN 1:5–10');
        });

        it('subtract removes overlapping verses', () => {
            const p1 = new Pericope('GEN 1:1-10');
            const p2 = new Pericope('GEN 1:5-15');
            expect(p1.subtract(p2).toString()).toBe('GEN 1:1–4');
        });

        it('normalize merges adjacent ranges', () => {
            const p = new Pericope('GEN 1:1-3,4-6');
            expect(p.normalize().toString()).toBe('GEN 1:1–6');
        });

        it('expand adds verses', () => {
            const p = new Pericope('GEN 1:5-10');
            const expanded = p.expand(2, 3);
            expect(expanded.firstVerse()?.verse).toBe(3);
            expect(expanded.lastVerse()?.verse).toBe(13);
        });

        it('contract removes verses', () => {
            const p = new Pericope('GEN 1:1-10');
            expect(p.contract(2, 3).toString()).toBe('GEN 1:3–7');
        });
    });
});
