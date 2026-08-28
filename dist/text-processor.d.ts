import { Book } from './book.js';
import { Pericope } from './pericope.js';
import { Range } from './range.js';
import { VersificationSystem } from './versification.js';
export declare class TextProcessor {
    /**
     * Scans a given text string for biblical references and returns
     * an array of Pericope objects.
     */
    static parse(text: string, system?: VersificationSystem): Pericope[];
    /**
     * Formats a Pericope object as a string in the specified format.
     */
    static formatPericope(pericope: Pericope, format?: 'canonical' | 'full_name' | 'abbreviated'): string;
    /**
     * Parses a single scripture reference string (e.g., "John 3:16-17")
     * into a book and a list of ranges.
     */
    static parseReference(referenceString: string, system?: VersificationSystem): {
        book: Book;
        ranges: Range[];
    };
    /**
     * Parses the verse range part of a reference string.
     * Handles multiple comma-separated ranges.
     */
    private static parseRanges;
    private static parseSingleRange;
    private static parseSingleReference;
    private static versesToRange;
    private static chaptersToRange;
    private static wholeBookRange;
    private static validateRange;
    /**
     * Suggests completions for a partial biblical reference.
     * Useful for building autocomplete functionality.
     */
    static suggestCompletions(input: string, system?: VersificationSystem): string[];
}
