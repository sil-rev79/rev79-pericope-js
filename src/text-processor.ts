import { Book } from './book.js';
import { Pericope, Range } from './pericope.js';
import { ParseError, InvalidBookError, InvalidChapterError, InvalidVerseError } from './errors.js';
import { VersificationSystem } from './versification.js';

export class TextProcessor {
    /**
     * Scans a given text string for biblical references and returns 
     * an array of Pericope objects.
     */
    static parse(text: string, system: VersificationSystem = 'english'): Pericope[] {
        const pericopes: Pericope[] = [];
        const pattern = /\b([A-Z]{3}|[1-3][A-Z]{2})\s+([0-9:,-]+)/gi;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            try {
                pericopes.push(new Pericope(`${match[1]} ${match[2]}`, system));
            } catch (e) {
                // Skip invalid
            }
        }
        return pericopes;
    }

    /**
     * Formats a Pericope object as a string in the specified format.
     */
    static formatPericope(pericope: Pericope, format: 'canonical' | 'full_name' | 'abbreviated' = 'canonical'): string {
        if (pericope.ranges.length === 0) return "";
        const bookPrefix = format === 'full_name' ? pericope.book.name : pericope.book.code;
        return `${bookPrefix} ${this.formatRanges(pericope.ranges)}`;
    }

    /**
     * Parses a single scripture reference string (e.g., "John 3:16-17") 
     * into a book and a list of ranges.
     */
    static parseReference(referenceString: string, system: VersificationSystem = 'english'): { book: Book, ranges: Range[] } {
        const trimmed = referenceString?.trim();
        if (!trimmed) throw new ParseError(referenceString, "empty reference");

        const parts = trimmed.split(/\s+/);
        if (parts.length < 1) throw new ParseError(referenceString, "no book found");

        // Handle books with spaces in names like "1 Corinthians"
        let book: Book | null = null;
        let rangePart = "";

        if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
            book = Book.findByName(`${parts[0]} ${parts[1]}`);
            if (book) {
                rangePart = parts.slice(2).join(" ");
            }
        }

        if (!book) {
            book = Book.findByName(parts[0]);
            rangePart = parts.slice(1).join(" ");
        }

        if (!book) throw new InvalidBookError(parts[0]);
        if (!rangePart) rangePart = "1:1";

        const ranges = this.parseRanges(rangePart, book);
        return { book, ranges };
    }

    /**
     * Converts an array of Range objects into a formatted string (e.g., "1:1-3,5").
     */
    private static formatRanges(ranges: Range[]): string {
        return ranges.map(r => {
            if (r.startChapter === r.endChapter && r.startVerse === r.endVerse) {
                return `${r.startChapter}:${r.startVerse}`;
            } else if (r.startChapter === r.endChapter) {
                return `${r.startChapter}:${r.startVerse}-${r.endVerse}`;
            } else {
                return `${r.startChapter}:${r.startVerse}-${r.endChapter}:${r.endVerse}`;
            }
        }).join(",");
    }

    /**
     * Parses the verse range part of a reference string.
     * Handles multiple comma-separated ranges.
     */
    private static parseRanges(rangeText: string, book: Book): Range[] {
        const ranges: Range[] = [];
        const parts = rangeText.split(",").map(p => p.trim());
        let currentChapter: number | null = null;

        for (const part of parts) {
            currentChapter = this.parseSingleRange(part, currentChapter, book, ranges);
        }
        return ranges;
    }

    /**
     * Parses a single range segment (e.g., "1:1-5" or "5-7").
     * Returns the chapter number to provide context for subsequent ranges.
     */
    private static parseSingleRange(part: string, currentChapter: number | null, book: Book, ranges: Range[]): number {
        let startChapter: number, startVerse: number, endChapter: number, endVerse: number;

        if (part.includes("-")) {
            const [startPart, endPart] = part.split("-").map(p => p.trim());
            [startChapter, startVerse] = this.parseVerseRef(startPart, currentChapter);

            if (endPart.includes(":")) {
                [endChapter, endVerse] = this.parseVerseRef(endPart, startChapter);
            } else {
                endChapter = startChapter;
                endVerse = parseInt(endPart, 10);
            }
        } else {
            [startChapter, startVerse] = this.parseVerseRef(part, currentChapter);
            endChapter = startChapter;
            endVerse = startVerse;
        }

        const range: Range = { startChapter, startVerse, endChapter, endVerse };
        this.validateRange(range, book);
        ranges.push(range);
        return startChapter;
    }

    private static parseVerseRef(text: string, currentChapter: number | null): [number, number] {
        if (text.includes(":")) {
            const [c, v] = text.split(":").map(s => parseInt(s, 10));
            return [c, v];
        } else if (currentChapter !== null) {
            return [currentChapter, parseInt(text, 10)];
        } else {
            return [parseInt(text, 10), 1];
        }
    }

    private static validateRange(range: Range, book: Book): void {
        if (!book.isValidChapter(range.startChapter)) throw new InvalidChapterError(book.code, range.startChapter);
        if (!book.isValidChapter(range.endChapter)) throw new InvalidChapterError(book.code, range.endChapter);
        if (!book.isValidVerse(range.startChapter, range.startVerse)) throw new InvalidVerseError(book.code, range.startChapter, range.startVerse);
        if (!book.isValidVerse(range.endChapter, range.endVerse)) throw new InvalidVerseError(book.code, range.endChapter, range.endVerse);
    }
}
