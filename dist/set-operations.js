import { VerseRef } from './verse-ref.js';
import { Pericope } from './pericope.js';
export class SetOperations {
    /**
     * Combines all verses from two pericopes into a new pericope.
     * Merges overlapping or adjacent ranges.
     */
    /**
     * Combines all verses from two pericopes into a new pericope.
     * Merges overlapping or adjacent ranges.
     */
    static union(pericope, other) {
        if (!this.isValidSetOperationTarget(pericope, other))
            return pericope;
        const combined = new Set([
            ...pericope.toArray().map((v) => v.toInt()),
            ...other.toArray().map((v) => v.toInt())
        ]);
        const verses = Array.from(combined)
            .sort((a, b) => a - b)
            .map(v => this.intToVerseRef(v, pericope.book));
        return this.versesToPericope(verses, pericope.book);
    }
    /**
     * Returns a new pericope containing only the verses that exist in both pericopes.
     */
    static intersection(pericope, other) {
        if (!this.isValidSetOperationTarget(pericope, other))
            return this.createEmptyPericope(pericope.book);
        const otherVerses = new Set(other.toArray().map((v) => v.toInt()));
        const common = pericope.toArray()
            .filter((v) => otherVerses.has(v.toInt()))
            .sort((a, b) => a.compareTo(b));
        if (common.length === 0)
            return this.createEmptyPericope(pericope.book);
        return this.versesToPericope(common, pericope.book);
    }
    /**
     * Returns a new pericope containing verses from the first pericope
     * that are NOT in the second one.
     */
    static subtract(pericope, other) {
        if (!this.isValidSetOperationTarget(pericope, other))
            return pericope;
        const otherVerses = new Set(other.toArray().map((v) => v.toInt()));
        const remaining = pericope.toArray()
            .filter((v) => !otherVerses.has(v.toInt()))
            .sort((a, b) => a.compareTo(b));
        if (remaining.length === 0)
            return this.createEmptyPericope(pericope.book);
        return this.versesToPericope(remaining, pericope.book);
    }
    /**
     * Returns the complement of the pericope within a given scope (defaults to the entire book).
     */
    static complement(pericope, scope) {
        const scopeVerses = this.determineScopeVerses(pericope, scope);
        const myVerses = new Set(pericope.toArray().map((v) => v.toInt()));
        const complement = (Array.from(scopeVerses))
            .filter((v) => !myVerses.has(v))
            .sort((a, b) => a - b)
            .map((v) => this.intToVerseRef(v, pericope.book));
        if (complement.length === 0)
            return this.createEmptyPericope(pericope.book);
        return this.versesToPericope(complement, pericope.book);
    }
    /**
     * Removes duplicates and merges adjacent or overlapping ranges.
     */
    static normalize(pericope) {
        if (pericope.ranges.length === 0)
            return pericope;
        const unique = (Array.from(new Set(pericope.toArray().map((v) => v.toInt()))))
            .sort((a, b) => a - b)
            .map((v) => this.intToVerseRef(v, pericope.book));
        return this.versesToPericope(unique, pericope.book);
    }
    /**
     * Expands the pericope by a specified number of verses before and after.
     */
    static expand(pericope, versesBefore = 0, versesAfter = 0) {
        if (versesBefore === 0 && versesAfter === 0)
            return pericope;
        const expanded = new Set(pericope.toArray().map((v) => v.toInt()));
        let currentBefore = pericope.firstVerse();
        for (let i = 0; i < versesBefore; i++) {
            const prev = currentBefore?.previousVerse();
            if (!prev)
                break;
            expanded.add(prev.toInt());
            currentBefore = prev;
        }
        let currentAfter = pericope.lastVerse();
        for (let i = 0; i < versesAfter; i++) {
            const nextV = currentAfter?.nextVerse();
            if (!nextV)
                break;
            expanded.add(nextV.toInt());
            currentAfter = nextV;
        }
        const sorted = Array.from(expanded)
            .sort((a, b) => a - b)
            .map(v => this.intToVerseRef(v, pericope.book));
        return this.versesToPericope(sorted, pericope.book);
    }
    /**
     * Removes a specified number of verses from the start and end of the pericope.
     */
    static contract(pericope, versesFromStart = 0, versesFromEnd = 0) {
        const verses = pericope.toArray().sort((a, b) => a.compareTo(b));
        if (verses.length <= (versesFromStart + versesFromEnd)) {
            return this.createEmptyPericope(pericope.book);
        }
        const startIdx = versesFromStart;
        const endIdx = verses.length - versesFromEnd;
        if (startIdx >= endIdx)
            return this.createEmptyPericope(pericope.book);
        return this.versesToPericope(verses.slice(startIdx, endIdx), pericope.book);
    }
    static isValidSetOperationTarget(pericope, other) {
        return other instanceof Pericope && pericope.book.equals(other.book);
    }
    static determineScopeVerses(pericope, scope) {
        if (scope && scope.book.equals(pericope.book)) {
            return new Set(scope.toArray().map((v) => v.toInt()));
        }
        return this.generateAllBookVerses(pericope.book);
    }
    static generateAllBookVerses(book) {
        const all = new Set();
        for (let chapter = 1; chapter <= book.chapterCount; chapter++) {
            for (let verse = 1; verse <= book.verseCount(chapter); verse++) {
                all.add((book.number * 1000000) + (chapter * 1000) + verse);
            }
        }
        return all;
    }
    static createEmptyPericope(book) {
        const empty = new Pericope(`${book.code} 1:1`);
        empty.ranges = [];
        return empty;
    }
    /**
     * Converts a list of individual verses back into a Pericope object
     * with optimized (merged) ranges.
     */
    static versesToPericope(verses, book) {
        if (verses.length === 0)
            return this.createEmptyPericope(book);
        const ranges = [];
        let currentStart = verses[0];
        let currentEnd = verses[0];
        for (let i = 1; i < verses.length; i++) {
            const nextOfEnd = currentEnd.nextVerse();
            if (nextOfEnd && nextOfEnd.toInt() === verses[i].toInt()) {
                currentEnd = verses[i];
            }
            else {
                ranges.push(this.buildRange(currentStart, currentEnd));
                currentStart = verses[i];
                currentEnd = verses[i];
            }
        }
        ranges.push(this.buildRange(currentStart, currentEnd));
        const p = new Pericope(`${book.code} 1:1`);
        p.ranges = ranges;
        p.book = book;
        return p;
    }
    static buildRange(start, end) {
        return {
            startChapter: start.chapter,
            startVerse: start.verse,
            endChapter: end.chapter,
            endVerse: end.verse
        };
    }
    static intToVerseRef(val, book) {
        const chapter = Math.floor((val % 1000000) / 1000);
        const verse = val % 1000;
        return new VerseRef(book, chapter, verse);
    }
}
//# sourceMappingURL=set-operations.js.map