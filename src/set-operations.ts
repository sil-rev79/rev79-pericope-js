import { VerseRef } from './verse-ref.js';
import { Pericope, Range } from './pericope.js';
import { Book } from './book.js';

export class SetOperations {
    /**
     * Combines all verses from two pericopes into a new pericope.
     * Merges overlapping or adjacent ranges.
     */
    /**
     * Combines all verses from two pericopes into a new pericope.
     * Merges overlapping or adjacent ranges.
     */
    static union(pericope: Pericope, other: Pericope): Pericope {
        if (!this.isValidSetOperationTarget(pericope, other)) return pericope;

        const combined = new Set<number>([
            ...pericope.toArray().map((v: VerseRef) => v.toInt()),
            ...other.toArray().map((v: VerseRef) => v.toInt())
        ]);
        const verses = Array.from(combined)
            .sort((a, b) => a - b)
            .map(v => this.intToVerseRef(v, pericope.book));

        return this.versesToPericope(verses, pericope.book);
    }

    /**
     * Returns a new pericope containing only the verses that exist in both pericopes.
     */
    static intersection(pericope: Pericope, other: Pericope): Pericope {
        if (!this.isValidSetOperationTarget(pericope, other)) return this.createEmptyPericope(pericope.book);

        const otherVerses = new Set(other.toArray().map((v: VerseRef) => v.toInt()));
        const common = pericope.toArray()
            .filter((v: VerseRef) => otherVerses.has(v.toInt()))
            .sort((a: VerseRef, b: VerseRef) => a.compareTo(b));

        if (common.length === 0) return this.createEmptyPericope(pericope.book);
        return this.versesToPericope(common, pericope.book);
    }

    /**
     * Returns a new pericope containing verses from the first pericope 
     * that are NOT in the second one.
     */
    static subtract(pericope: Pericope, other: Pericope): Pericope {
        if (!this.isValidSetOperationTarget(pericope, other)) return pericope;

        const otherVerses = new Set(other.toArray().map((v: VerseRef) => v.toInt()));
        const remaining = pericope.toArray()
            .filter((v: VerseRef) => !otherVerses.has(v.toInt()))
            .sort((a: VerseRef, b: VerseRef) => a.compareTo(b));

        if (remaining.length === 0) return this.createEmptyPericope(pericope.book);
        return this.versesToPericope(remaining, pericope.book);
    }

    /**
     * Returns the complement of the pericope within a given scope (defaults to the entire book).
     */
    static complement(pericope: Pericope, scope?: Pericope): Pericope {
        const scopeVerses = this.determineScopeVerses(pericope, scope);
        const myVerses = new Set(pericope.toArray().map((v: VerseRef) => v.toInt()));
        const complement = (Array.from<number>(scopeVerses))
            .filter((v: number) => !myVerses.has(v))
            .sort((a: number, b: number) => a - b)
            .map((v: number) => this.intToVerseRef(v, pericope.book));

        if (complement.length === 0) return this.createEmptyPericope(pericope.book);
        return this.versesToPericope(complement, pericope.book);
    }

    /**
     * Removes duplicates and merges adjacent or overlapping ranges.
     */
    static normalize(pericope: Pericope): Pericope {
        if (pericope.ranges.length === 0) return pericope;
        const unique = (Array.from<number>(new Set(pericope.toArray().map((v: VerseRef) => v.toInt()))))
            .sort((a: number, b: number) => a - b)
            .map((v: number) => this.intToVerseRef(v, pericope.book));
        return this.versesToPericope(unique, pericope.book);
    }

    /**
     * Expands the pericope by a specified number of verses before and after.
     */
    static expand(pericope: Pericope, versesBefore: number = 0, versesAfter: number = 0): Pericope {
        if (versesBefore === 0 && versesAfter === 0) return pericope;

        const expanded = new Set<number>(pericope.toArray().map((v: VerseRef) => v.toInt()));

        let currentBefore = pericope.firstVerse();
        for (let i = 0; i < versesBefore; i++) {
            const prev = currentBefore?.previousVerse();
            if (!prev) break;
            expanded.add(prev.toInt());
            currentBefore = prev;
        }

        let currentAfter = pericope.lastVerse();
        for (let i = 0; i < versesAfter; i++) {
            const nextV = currentAfter?.nextVerse();
            if (!nextV) break;
            expanded.add(nextV.toInt());
            currentAfter = nextV;
        }

        const sorted = Array.from<number>(expanded)
            .sort((a, b) => a - b)
            .map(v => this.intToVerseRef(v, pericope.book));
        return this.versesToPericope(sorted, pericope.book);
    }

    /**
     * Removes a specified number of verses from the start and end of the pericope.
     */
    static contract(pericope: Pericope, versesFromStart: number = 0, versesFromEnd: number = 0): Pericope {
        const verses = pericope.toArray().sort((a: VerseRef, b: VerseRef) => a.compareTo(b));
        if (verses.length <= (versesFromStart + versesFromEnd)) {
            return this.createEmptyPericope(pericope.book);
        }

        const startIdx = versesFromStart;
        const endIdx = verses.length - versesFromEnd;
        if (startIdx >= endIdx) return this.createEmptyPericope(pericope.book);

        return this.versesToPericope(verses.slice(startIdx, endIdx), pericope.book);
    }

    private static isValidSetOperationTarget(pericope: Pericope, other: Pericope): boolean {
        return other instanceof Pericope && pericope.book.equals(other.book);
    }

    private static determineScopeVerses(pericope: Pericope, scope?: Pericope): Set<number> {
        if (scope && scope.book.equals(pericope.book)) {
            return new Set(scope.toArray().map((v: VerseRef) => v.toInt()));
        }
        return this.generateAllBookVerses(pericope.book);
    }

    private static generateAllBookVerses(book: Book): Set<number> {
        const all = new Set<number>();
        for (let chapter = 1; chapter <= book.chapterCount; chapter++) {
            for (let verse = 1; verse <= book.verseCount(chapter); verse++) {
                all.add((book.number * 1000000) + (chapter * 1000) + verse);
            }
        }
        return all;
    }

    private static createEmptyPericope(book: Book): Pericope {
        const empty = new Pericope(`${book.code} 1:1`);
        (empty as any).ranges = [];
        return empty;
    }

    /**
     * Converts a list of individual verses back into a Pericope object 
     * with optimized (merged) ranges.
     */
    private static versesToPericope(verses: VerseRef[], book: Book): Pericope {
        if (verses.length === 0) return this.createEmptyPericope(book);

        const ranges: Range[] = [];
        let currentStart = verses[0];
        let currentEnd = verses[0];

        for (let i = 1; i < verses.length; i++) {
            const nextOfEnd = currentEnd.nextVerse();
            if (nextOfEnd && nextOfEnd.toInt() === verses[i].toInt()) {
                currentEnd = verses[i];
            } else {
                ranges.push(this.buildRange(currentStart, currentEnd));
                currentStart = verses[i];
                currentEnd = verses[i];
            }
        }
        ranges.push(this.buildRange(currentStart, currentEnd));

        const p = new Pericope(`${book.code} 1:1`);
        (p as any).ranges = ranges;
        (p as any).book = book;
        return p;
    }

    private static buildRange(start: VerseRef, end: VerseRef): Range {
        return {
            startChapter: start.chapter,
            startVerse: start.verse,
            endChapter: end.chapter,
            endVerse: end.verse
        };
    }

    private static intToVerseRef(val: number, book: Book): VerseRef {
        const chapter = Math.floor((val % 1000000) / 1000);
        const verse = val % 1000;
        return new VerseRef(book, chapter, verse);
    }
}
