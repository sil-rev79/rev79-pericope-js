import { Book } from './book.js';
import { Pericope, Range } from './pericope.js';
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
     * Converts an array of Range objects into a formatted string (e.g., "1:1-3,5").
     */
    private static formatRanges;
    /**
     * Parses the verse range part of a reference string.
     * Handles multiple comma-separated ranges.
     */
    private static parseRanges;
    /**
     * Parses a single range segment (e.g., "1:1-5" or "5-7").
     * Returns the chapter number to provide context for subsequent ranges.
     */
    private static parseSingleRange;
    private static parseVerseRef;
    private static validateRange;
    /**
     * Suggests completions for a partial biblical reference.
     * Useful for building autocomplete functionality.
     */
    static suggestCompletions(input: string, system?: VersificationSystem): string[];
}
