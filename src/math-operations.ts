import { VerseRef } from './verse-ref.js';
import { Pericope, Range } from './pericope.js';

export class MathOperations {
    /**
     * Calculates the number of verses in a specific chapter that are included 
     * in the given pericope.
     */
    static versesInChapter(pericope: Pericope, chapter: number): number {
        if (chapter <= 0 || chapter > pericope.book.chapterCount) return 0;

        let count = 0;
        for (const range of pericope.ranges) {
            if (chapter >= range.startChapter && chapter <= range.endChapter) {
                const startVerse = chapter === range.startChapter ? range.startVerse : 1;
                const endVerse = chapter === range.endChapter ? range.endVerse : pericope.book.verseCount(chapter);
                count += (endVerse - startVerse + 1);
            }
        }
        return count;
    }

    /**
     * Returns a breakdown of all included chapters and their corresponding verses.
     * Returns an object where keys are chapter numbers and values are arrays of verse numbers.
     */
    static chaptersInRange(pericope: Pericope): Record<number, number[]> {
        const result: Record<number, number[]> = {};
        for (const range of pericope.ranges) {
            for (let chapter = range.startChapter; chapter <= range.endChapter; chapter++) {
                if (!result[chapter]) result[chapter] = [];
                const startVerse = chapter === range.startChapter ? range.startVerse : 1;
                const endVerse = chapter === range.endChapter ? range.endVerse : pericope.book.verseCount(chapter);

                for (let verse = startVerse; verse <= endVerse; verse++) {
                    if (!result[chapter].includes(verse)) {
                        result[chapter].push(verse);
                    }
                }
            }
        }
        for (const chapterKey in result) {
            const chapter = parseInt(chapterKey, 10);
            result[chapter].sort((a: number, b: number) => a - b);
        }
        return result;
    }

    /**
     * Calculates the "density" of the pericope: the ratio of included verses 
     * to the total possible verses in the chapters spanned by the pericope.
     */
    static density(pericope: Pericope): number {
        if (pericope.ranges.length === 0) return 0.0;

        let totalPossible = 0;
        const includedVerses = pericope.verseCount();

        for (const chapter of pericope.chapterList()) {
            totalPossible += pericope.book.verseCount(chapter);
        }

        if (totalPossible === 0) return 0.0;
        return includedVerses / totalPossible;
    }

    /**
     * Identifies verses that are missing (gaps) between the first and last 
     * verse of the pericope.
     */
    static gaps(pericope: Pericope): VerseRef[] {
        if (pericope.ranges.length === 0 || pericope.isSingleVerse()) return [];

        const allVersesSet = new Set(pericope.toArray().map((v: VerseRef) => v.toInt()));
        const first = pericope.firstVerse();
        const last = pericope.lastVerse();
        if (!first || !last) return [];

        const gaps: VerseRef[] = [];
        let current: VerseRef | undefined = first;
        const lastInt = last.toInt();

        while (current && current.toInt() <= lastInt) {
            if (!allVersesSet.has(current.toInt())) {
                gaps.push(current);
            }
            current = current.nextVerse();
        }
        return gaps;
    }

    /**
     * Breaks a potentially discontinuous pericope into a list of 
     * continuous pericopes.
     */
    static continuousRanges(pericope: Pericope): Pericope[] {
        if (pericope.ranges.length === 0) return [];

        const verses = pericope.toArray().sort((a: VerseRef, b: VerseRef) => a.compareTo(b));
        if (verses.length <= 1) return [pericope];

        const groups: VerseRef[][] = [];
        let currentGroup: VerseRef[] = [verses[0]];

        for (let i = 1; i < verses.length; i++) {
            const prev = currentGroup[currentGroup.length - 1];
            const curr = verses[i];
            const nextOfPrev = prev.nextVerse();
            if (nextOfPrev && nextOfPrev.toInt() === curr.toInt()) {
                currentGroup.push(curr);
            } else {
                groups.push(currentGroup);
                currentGroup = [curr];
            }
        }
        groups.push(currentGroup);

        return groups.map((group: VerseRef[]) => this.createPericopeFromGroup(group, pericope.book));
    }

    /**
     * Returns true if two pericopes share any common verses.
     */
    static intersects(pericope: Pericope, other: Pericope): boolean {
        if (!this.isValidComparisonTarget(pericope, other)) return false;

        const myVerses = new Set(pericope.toArray().map((v: VerseRef) => v.toInt()));
        for (const verse of other.toArray()) {
            if (myVerses.has(verse.toInt())) return true;
        }
        return false;
    }

    /**
     * Returns true if the first pericope completely contains the second one.
     */
    static contains(pericope: Pericope, other: Pericope): boolean {
        if (!this.isValidComparisonTarget(pericope, other)) return false;

        const myVerses = new Set(pericope.toArray().map((v: VerseRef) => v.toInt()));
        for (const verse of other.toArray()) {
            if (!myVerses.has(verse.toInt())) return false;
        }
        return true;
    }

    static isAdjacentTo(pericope: Pericope, other: Pericope): boolean {
        if (!this.isValidComparisonTarget(pericope, other)) return false;

        const myLast = pericope.lastVerse();
        const otherFirst = other.firstVerse();
        const myFirst = pericope.firstVerse();
        const otherLast = other.lastVerse();

        if (!myLast || !otherFirst || !myFirst || !otherLast) return false;

        const nextOfMyLast = myLast.nextVerse();
        const nextOfOtherLast = otherLast.nextVerse();

        return (nextOfMyLast?.toInt() === otherFirst.toInt()) || (nextOfOtherLast?.toInt() === myFirst.toInt());
    }

    static precedes(pericope: Pericope, other: Pericope): boolean {
        if (!this.isValidComparisonTarget(pericope, other)) return false;
        const myLast = pericope.lastVerse();
        const otherFirst = other.firstVerse();
        if (!myLast || !otherFirst) return false;
        return myLast.isBefore(otherFirst);
    }

    static follows(pericope: Pericope, other: Pericope): boolean {
        if (!this.isValidComparisonTarget(pericope, other)) return false;
        const myFirst = pericope.firstVerse();
        const otherLast = other.lastVerse();
        if (!myFirst || !otherLast) return false;
        return myFirst.isAfter(otherLast);
    }

    private static isValidComparisonTarget(pericope: Pericope, other: Pericope): boolean {
        return other instanceof Pericope && pericope.book.equals(other.book);
    }

    private static createPericopeFromGroup(group: VerseRef[], book: any): Pericope {
        if (group.length === 1) {
            return new Pericope(`${book.code} ${group[0].chapter}:${group[0].verse}`);
        }
        const first = group[0];
        const last = group[group.length - 1];
        if (first.chapter === last.chapter) {
            return new Pericope(`${book.code} ${first.chapter}:${first.verse}-${last.verse}`);
        } else {
            return new Pericope(`${book.code} ${first.chapter}:${first.verse}-${last.chapter}:${last.verse}`);
        }
    }
}
