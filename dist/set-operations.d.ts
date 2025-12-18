import { Pericope } from './pericope.js';
export declare class SetOperations {
    /**
     * Combines all verses from two pericopes into a new pericope.
     * Merges overlapping or adjacent ranges.
     */
    /**
     * Combines all verses from two pericopes into a new pericope.
     * Merges overlapping or adjacent ranges.
     */
    static union(pericope: Pericope, other: Pericope): Pericope;
    /**
     * Returns a new pericope containing only the verses that exist in both pericopes.
     */
    static intersection(pericope: Pericope, other: Pericope): Pericope;
    /**
     * Returns a new pericope containing verses from the first pericope
     * that are NOT in the second one.
     */
    static subtract(pericope: Pericope, other: Pericope): Pericope;
    /**
     * Returns the complement of the pericope within a given scope (defaults to the entire book).
     */
    static complement(pericope: Pericope, scope?: Pericope): Pericope;
    /**
     * Removes duplicates and merges adjacent or overlapping ranges.
     */
    static normalize(pericope: Pericope): Pericope;
    /**
     * Expands the pericope by a specified number of verses before and after.
     */
    static expand(pericope: Pericope, versesBefore?: number, versesAfter?: number): Pericope;
    /**
     * Removes a specified number of verses from the start and end of the pericope.
     */
    static contract(pericope: Pericope, versesFromStart?: number, versesFromEnd?: number): Pericope;
    private static isValidSetOperationTarget;
    private static determineScopeVerses;
    private static generateAllBookVerses;
    private static createEmptyPericope;
    /**
     * Converts a list of individual verses back into a Pericope object
     * with optimized (merged) ranges.
     */
    private static versesToPericope;
    private static buildRange;
    private static intToVerseRef;
}
