import { VerseRef } from './verse-ref.js';
import { Pericope } from './pericope.js';
export declare class MathOperations {
    /**
     * Calculates the number of verses in a specific chapter that are included
     * in the given pericope.
     */
    static versesInChapter(pericope: Pericope, chapter: number): number;
    /**
     * Returns a breakdown of all included chapters and their corresponding verses.
     * Returns an object where keys are chapter numbers and values are arrays of verse numbers.
     */
    static chaptersInRange(pericope: Pericope): Record<number, number[]>;
    /**
     * Calculates the "density" of the pericope: the ratio of included verses
     * to the total possible verses in the chapters spanned by the pericope.
     */
    static density(pericope: Pericope): number;
    /**
     * Identifies verses that are missing (gaps) between the first and last
     * verse of the pericope.
     */
    static gaps(pericope: Pericope): VerseRef[];
    /**
     * Breaks a potentially discontinuous pericope into a list of
     * continuous pericopes.
     */
    static continuousRanges(pericope: Pericope): Pericope[];
    /**
     * Returns true if two pericopes share any common verses.
     */
    static intersects(pericope: Pericope, other: Pericope): boolean;
    /**
     * Returns true if the first pericope completely contains the second one.
     */
    static contains(pericope: Pericope, other: Pericope): boolean;
    static isAdjacentTo(pericope: Pericope, other: Pericope): boolean;
    static precedes(pericope: Pericope, other: Pericope): boolean;
    static follows(pericope: Pericope, other: Pericope): boolean;
    private static isValidComparisonTarget;
    private static createPericopeFromGroup;
}
