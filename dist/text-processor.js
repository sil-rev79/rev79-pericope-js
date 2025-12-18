import { Book } from './book.js';
import { Pericope } from './pericope.js';
import { ParseError, InvalidBookError, InvalidChapterError, InvalidVerseError } from './errors.js';
export class TextProcessor {
    /**
     * Scans a given text string for biblical references and returns
     * an array of Pericope objects.
     */
    static parse(text, system = 'english') {
        const pericopes = [];
        const pattern = /\b([A-Z]{3}|[1-3][A-Z]{2})\s+([0-9:,-]+)/gi;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            try {
                pericopes.push(new Pericope(`${match[1]} ${match[2]}`, system));
            }
            catch (e) {
                // Skip invalid
            }
        }
        return pericopes;
    }
    /**
     * Formats a Pericope object as a string in the specified format.
     */
    static formatPericope(pericope, format = 'canonical') {
        if (pericope.ranges.length === 0)
            return "";
        const bookPrefix = format === 'full_name' ? pericope.book.name : pericope.book.code;
        return `${bookPrefix} ${this.formatRanges(pericope.ranges)}`;
    }
    /**
     * Parses a single scripture reference string (e.g., "John 3:16-17")
     * into a book and a list of ranges.
     */
    static parseReference(referenceString, system = 'english') {
        const trimmed = referenceString?.trim();
        if (!trimmed)
            throw new ParseError(referenceString, "empty reference");
        const parts = trimmed.split(/\s+/);
        if (parts.length < 1)
            throw new ParseError(referenceString, "no book found");
        // Handle books with spaces in names like "1 Corinthians"
        let book = null;
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
        if (!book)
            throw new InvalidBookError(parts[0]);
        if (!rangePart)
            rangePart = "1:1";
        const ranges = this.parseRanges(rangePart, book);
        return { book, ranges };
    }
    /**
     * Converts an array of Range objects into a formatted string (e.g., "1:1-3,5").
     */
    static formatRanges(ranges) {
        return ranges.map(r => {
            if (r.startChapter === r.endChapter && r.startVerse === r.endVerse) {
                return `${r.startChapter}:${r.startVerse}`;
            }
            else if (r.startChapter === r.endChapter) {
                return `${r.startChapter}:${r.startVerse}-${r.endVerse}`;
            }
            else {
                return `${r.startChapter}:${r.startVerse}-${r.endChapter}:${r.endVerse}`;
            }
        }).join(",");
    }
    /**
     * Parses the verse range part of a reference string.
     * Handles multiple comma-separated ranges.
     */
    static parseRanges(rangeText, book) {
        const ranges = [];
        const parts = rangeText.split(",").map(p => p.trim());
        let currentChapter = null;
        for (const part of parts) {
            currentChapter = this.parseSingleRange(part, currentChapter, book, ranges);
        }
        return ranges;
    }
    /**
     * Parses a single range segment (e.g., "1:1-5" or "5-7").
     * Returns the chapter number to provide context for subsequent ranges.
     */
    static parseSingleRange(part, currentChapter, book, ranges) {
        let startChapter, startVerse, endChapter, endVerse;
        if (part.includes("-")) {
            const [startPart, endPart] = part.split("-").map(p => p.trim());
            [startChapter, startVerse] = this.parseVerseRef(startPart, currentChapter);
            if (endPart.includes(":")) {
                [endChapter, endVerse] = this.parseVerseRef(endPart, startChapter);
            }
            else {
                endChapter = startChapter;
                endVerse = parseInt(endPart, 10);
            }
        }
        else {
            [startChapter, startVerse] = this.parseVerseRef(part, currentChapter);
            endChapter = startChapter;
            endVerse = startVerse;
        }
        const range = { startChapter, startVerse, endChapter, endVerse };
        this.validateRange(range, book);
        ranges.push(range);
        return startChapter;
    }
    static parseVerseRef(text, currentChapter) {
        if (text.includes(":")) {
            const [c, v] = text.split(":").map(s => parseInt(s, 10));
            return [c, v];
        }
        else if (currentChapter !== null) {
            return [currentChapter, parseInt(text, 10)];
        }
        else {
            return [parseInt(text, 10), 1];
        }
    }
    static validateRange(range, book) {
        if (!book.isValidChapter(range.startChapter))
            throw new InvalidChapterError(book.code, range.startChapter);
        if (!book.isValidChapter(range.endChapter))
            throw new InvalidChapterError(book.code, range.endChapter);
        if (!book.isValidVerse(range.startChapter, range.startVerse))
            throw new InvalidVerseError(book.code, range.startChapter, range.startVerse);
        if (!book.isValidVerse(range.endChapter, range.endVerse))
            throw new InvalidVerseError(book.code, range.endChapter, range.endVerse);
    }
    /**
     * Suggests completions for a partial biblical reference.
     * Useful for building autocomplete functionality.
     */
    static suggestCompletions(input, system = 'english') {
        const trimmed = input.trim();
        if (!trimmed) {
            // Suggest some common books if input is empty
            return ["Genesis", "Exodus", "Matthew", "Mark", "Luke", "John", "Acts", "Romans"];
        }
        const parts = trimmed.split(/\s+/);
        const bookPart = parts[0];
        const rangePart = parts.slice(1).join(" ");
        // 1. Partial Book Name Matching
        // Only if we don't have a space followed by something else, or if the first part is clearly a partial book
        const allBooks = Book.allBooks();
        const bookMatches = allBooks.filter(b => b.name.toLowerCase().startsWith(trimmed.toLowerCase()) ||
            b.aliases.some(a => a.toLowerCase().startsWith(trimmed.toLowerCase())));
        if (bookMatches.length > 0 && parts.length === 1) {
            const isExactFullName = bookMatches.some(b => b.name.toLowerCase() === trimmed.toLowerCase());
            if (bookMatches.length > 1 || !isExactFullName) {
                // If it matches multiple books partially, or isn't an exact full name, suggest the names
                return Array.from(new Set(bookMatches.map(b => b.name))).slice(0, 10);
            }
        }
        // 2. Handle cases like "1 Cor" where there's a space within the book name
        if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
            const potentialBookName = `${parts[0]} ${parts[1]}`;
            const startMatches = allBooks.filter(b => b.name.toLowerCase().startsWith(potentialBookName.toLowerCase()) ||
                b.aliases.some(a => a.toLowerCase().startsWith(potentialBookName.toLowerCase())));
            if (startMatches.length > 0 && parts.length === 2) {
                return Array.from(new Set(startMatches.map(b => b.name))).slice(0, 10);
            }
        }
        // 3. If a full book is identified, suggest chapters or verses
        let book = null;
        let referenceContent = "";
        // Re-check book identification similar to parseReference
        if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
            book = Book.findByName(`${parts[0]} ${parts[1]}`);
            if (book)
                referenceContent = parts.slice(2).join(" ");
        }
        if (!book) {
            book = Book.findByName(parts[0]);
            if (book)
                referenceContent = parts.slice(1).join(" ");
        }
        if (book) {
            // Use the actual name from the input if it's a valid alias, otherwise use book.name
            let matchedName = book.name;
            const inputLower = parts[0].toLowerCase();
            if (book.aliases.some(a => a.toLowerCase() === inputLower)) {
                // Try to find the alias that matches case-insensitively but use the original casing from the input?
                // Actually, let's just use the book's standard name for consistency in suggestions,
                // but if the user typed "Psalms" and it's an alias, use that.
                const aliasMatch = book.aliases.find(a => a.toLowerCase() === inputLower);
                if (aliasMatch)
                    matchedName = aliasMatch;
            }
            else if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
                const twoPartLower = `${parts[0]} ${parts[1]}`.toLowerCase();
                const aliasMatch = book.aliases.find(a => a.toLowerCase() === twoPartLower);
                if (aliasMatch)
                    matchedName = aliasMatch;
            }
            const prefix = matchedName + " ";
            if (!referenceContent) {
                // Suggest first few chapters
                const suggestions = [];
                for (let i = 1; i <= Math.min(book.chapterCount, 10); i++) {
                    suggestions.push(`${prefix}${i}`);
                }
                return suggestions;
            }
            // Reference content exists (e.g., "John 3", "John 3:16")
            if (!referenceContent.includes(":")) {
                const chapterNum = parseInt(referenceContent, 10);
                // Prioritize completion if they are still typing the number
                const completions = [];
                for (let i = 1; i <= book.chapterCount; i++) {
                    if (i.toString().startsWith(referenceContent) && i.toString() !== referenceContent) {
                        completions.push(`${prefix}${i}`);
                        if (completions.length >= 10)
                            break;
                    }
                }
                if (completions.length > 0)
                    return completions;
                if (!isNaN(chapterNum) && book.isValidChapter(chapterNum, system)) {
                    // It's a valid chapter, suggest adding a colon for verses
                    return [`${prefix}${chapterNum}:`];
                }
                return [];
            }
            else {
                // Has a colon, e.g., "John 3:1"
                const colonParts = referenceContent.split(":");
                const chapterNum = parseInt(colonParts[0], 10);
                const versePart = colonParts[1];
                if (book.isValidChapter(chapterNum, system)) {
                    const verseCount = book.verseCount(chapterNum, system);
                    if (!versePart) {
                        // Suggest first few verses
                        const suggestions = [];
                        for (let i = 1; i <= Math.min(verseCount, 20); i++) {
                            suggestions.push(`${prefix}${chapterNum}:${i}`);
                        }
                        return suggestions;
                    }
                    // Typing a verse
                    if (/^\d+$/.test(versePart)) {
                        const verseNum = parseInt(versePart, 10);
                        // Prioritize completion if typing
                        const completions = [];
                        for (let i = 1; i <= verseCount; i++) {
                            if (i.toString().startsWith(versePart) && i.toString() !== versePart) {
                                completions.push(`${prefix}${chapterNum}:${i}`);
                                if (completions.length >= 10)
                                    break;
                            }
                        }
                        if (completions.length > 0)
                            return completions;
                        if (book.isValidVerse(chapterNum, verseNum, system)) {
                            // Valid verse, suggest range or another verse
                            return [
                                `${prefix}${chapterNum}:${verseNum}-`,
                                `${prefix}${chapterNum}:${verseNum},`
                            ];
                        }
                    }
                }
            }
        }
        return [];
    }
}
//# sourceMappingURL=text-processor.js.map