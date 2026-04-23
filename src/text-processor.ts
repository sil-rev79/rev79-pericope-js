import { Book } from './book.js';
import { Pericope } from './pericope.js';
import { Range } from './range.js';
import {
    ParseError,
    InvalidBookError,
    InvalidChapterError,
    InvalidVerseError,
    InvalidRangeError,
} from './errors.js';
import { VersificationSystem } from './versification.js';

export class TextProcessor {
    /**
     * Scans a given text string for biblical references and returns
     * an array of Pericope objects.
     */
    static parse(
        text: string,
        system: VersificationSystem = 'english',
    ): Pericope[] {
        const pericopes: Pericope[] = [];
        const pattern = /\b([A-Z]{3}|[1-3][A-Z]{2})\s+([0-9:\.,;\-–]+)/gi;
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
    static formatPericope(
        pericope: Pericope,
        format: 'canonical' | 'full_name' | 'abbreviated' = 'canonical',
    ): string {
        if (pericope.ranges.length === 0) return '';
        const bookPrefix =
            format === 'full_name' ? pericope.book.name : pericope.book.code;
        return `${bookPrefix} ${this.formatRanges(pericope.ranges)}`;
    }

    /**
     * Parses a single scripture reference string (e.g., "John 3:16-17")
     * into a book and a list of ranges.
     */
    static parseReference(
        referenceString: string,
        system: VersificationSystem = 'english',
    ): { book: Book; ranges: Range[] } {
        const trimmed = referenceString?.trim();
        if (!trimmed) throw new ParseError(referenceString, 'empty reference');

        const parts = trimmed.split(/\s+/);
        if (parts.length < 1)
            throw new ParseError(referenceString, 'no book found');

        // Handle books with spaces in names like "1 Corinthians"
        let book: Book | null = null;
        let rangePart = '';

        if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
            book = Book.findByName(`${parts[0]} ${parts[1]}`);
            if (book) {
                rangePart = parts.slice(2).join(' ');
            }
        } else if (parts.length >= 3 && parts[0].toLowerCase() == 'song') {
            book = Book.findByName(`${parts[0]} ${parts[1]} ${parts[2]}`);
            if (book) {
                rangePart = parts.slice(3).join(' ');
            }
        }

        if (!book) {
            book = Book.findByName(parts[0]);
            rangePart = parts.slice(1).join(' ');
        }

        if (!book) throw new InvalidBookError(parts[0]);

        const ranges = rangePart
            ? this.parseRanges(rangePart, book, system)
            : [this.wholeBookRange(book, system)];
        return { book, ranges };
    }

    /**
     * Parses the verse range part of a reference string.
     * Handles multiple comma-separated ranges.
     */
    private static parseRanges(
        rangeText: string,
        book: Book,
        system: VersificationSystem,
    ): Range[] {
        const ranges: Range[] = [];
        const parts = rangeText
            .replaceAll(';', ',')
            .replaceAll('.', ':')
            .replaceAll('–', '-')
            .split(',')
            .map((p) => p.trim());
        let context: number | 'chapter_mode' | null = null;

        for (const part of parts) {
            context = part.includes('-')
                ? this.parseSingleRange(part, context, book, ranges, system)
                : this.parseSingleReference(
                      part,
                      context,
                      book,
                      ranges,
                      system,
                  );
        }
        return ranges;
    }

    private static parseSingleRange(
        rangeText: string,
        context: number | 'chapter_mode' | null,
        book: Book,
        ranges: Range[],
        system: VersificationSystem,
    ): number | 'chapter_mode' | null {
        const [startPart, endPart] = rangeText.split('-').map((p) => p.trim());
        let newContext: number | 'chapter_mode' | null;

        if (startPart.includes(':')) {
            const [startChapter, startVerse] = startPart
                .split(':')
                .map((s) => parseInt(s, 10));
            let endChapter: number, endVerse: number;
            if (endPart.includes(':')) {
                [endChapter, endVerse] = endPart
                    .split(':')
                    .map((s) => parseInt(s, 10));
            } else {
                endChapter = startChapter;
                endVerse = parseInt(endPart, 10);
            }
            ranges.push(
                new Range(startChapter, startVerse, endChapter, endVerse),
            );
            newContext = endChapter;
        } else if (endPart.includes(':')) {
            let startChapter: number, startVerse: number;
            if (typeof context === 'number') {
                startChapter = context;
                startVerse = parseInt(startPart, 10);
            } else {
                startChapter = parseInt(startPart, 10);
                startVerse = 1;
            }
            const [endChapter, endVerse] = endPart
                .split(':')
                .map((s) => parseInt(s, 10));
            ranges.push(
                new Range(startChapter, startVerse, endChapter, endVerse),
            );
            newContext = endChapter;
        } else if (book.chapterCount === 1) {
            ranges.push(
                this.versesToRange(
                    1,
                    parseInt(startPart, 10),
                    parseInt(endPart, 10),
                ),
            );
            newContext = 1;
        } else if (typeof context === 'number') {
            ranges.push(
                this.versesToRange(
                    context,
                    parseInt(startPart, 10),
                    parseInt(endPart, 10),
                ),
            );
            newContext = context;
        } else {
            ranges.push(
                this.chaptersToRange(
                    book,
                    parseInt(startPart, 10),
                    parseInt(endPart, 10),
                    system,
                ),
            );
            newContext = 'chapter_mode';
        }

        const addedRange = ranges[ranges.length - 1];
        this.validateRange(addedRange, book, system);
        return newContext;
    }

    private static parseSingleReference(
        refText: string,
        context: number | 'chapter_mode' | null,
        book: Book,
        ranges: Range[],
        system: VersificationSystem,
    ): number | 'chapter_mode' | null {
        let newContext: number | 'chapter_mode' | null;

        if (refText.includes(':')) {
            const [chapter, verse] = refText
                .split(':')
                .map((s) => parseInt(s, 10));
            ranges.push(this.versesToRange(chapter, verse, verse));
            newContext = chapter;
        } else if (book.chapterCount === 1) {
            ranges.push(
                this.versesToRange(
                    1,
                    parseInt(refText, 10),
                    parseInt(refText, 10),
                ),
            );
            newContext = 1;
        } else if (typeof context === 'number') {
            ranges.push(
                this.versesToRange(
                    context,
                    parseInt(refText, 10),
                    parseInt(refText, 10),
                ),
            );
            newContext = context;
        } else {
            ranges.push(
                this.chaptersToRange(
                    book,
                    parseInt(refText, 10),
                    parseInt(refText, 10),
                    system,
                ),
            );
            newContext = 'chapter_mode';
        }

        const addedRange = ranges[ranges.length - 1];
        this.validateRange(addedRange, book, system);
        return newContext;
    }

    private static versesToRange(
        chapter: number,
        startVerse: number,
        endVerse: number,
    ): Range {
        return new Range(chapter, startVerse, chapter, endVerse);
    }

    private static chaptersToRange(
        book: Book,
        startChapter: number,
        endChapter: number,
        system: VersificationSystem,
    ): Range {
        return new Range(
            startChapter,
            1,
            endChapter,
            book.verseCount(endChapter, system),
        );
    }

    private static wholeBookRange(
        book: Book,
        system: VersificationSystem,
    ): Range {
        return new Range(
            1,
            1,
            book.chapterCount,
            book.verseCount(book.chapterCount, system),
        );
    }

    private static validateRange(
        range: Range,
        book: Book,
        system: VersificationSystem,
    ): void {
        if (!book.isValidChapter(range.startChapter, system))
            throw new InvalidChapterError(book.code, range.startChapter);
        if (!book.isValidChapter(range.endChapter, system))
            throw new InvalidChapterError(book.code, range.endChapter);
        if (!book.isValidVerse(range.startChapter, range.startVerse, system))
            throw new InvalidVerseError(
                book.code,
                range.startChapter,
                range.startVerse,
            );
        if (!book.isValidVerse(range.endChapter, range.endVerse, system))
            throw new InvalidVerseError(
                book.code,
                range.endChapter,
                range.endVerse,
            );
        if (
            range.startChapter > range.endChapter ||
            (range.startChapter == range.endChapter &&
                range.startVerse > range.endVerse)
        )
            throw new InvalidRangeError(range);
    }

    /**
     * Suggests completions for a partial biblical reference.
     * Useful for building autocomplete functionality.
     */
    static suggestCompletions(
        input: string,
        system: VersificationSystem = 'english',
    ): string[] {
        const trimmed = input.trim();
        if (!trimmed) {
            // Suggest some common books if input is empty
            return [
                'Genesis',
                'Exodus',
                'Matthew',
                'Mark',
                'Luke',
                'John',
                'Acts',
                'Romans',
            ];
        }

        const parts = trimmed.split(/\s+/);
        const bookPart = parts[0];
        const rangePart = parts.slice(1).join(' ');

        // 1. Partial Book Name Matching
        // Only if we don't have a space followed by something else, or if the first part is clearly a partial book
        const allBooks = Book.allBooks();
        const bookMatches = allBooks.filter(
            (b) =>
                b.name.toLowerCase().startsWith(trimmed.toLowerCase()) ||
                b.aliases.some((a) =>
                    a.toLowerCase().startsWith(trimmed.toLowerCase()),
                ),
        );

        if (bookMatches.length > 0 && parts.length === 1) {
            const isExactFullName = bookMatches.some(
                (b) => b.name.toLowerCase() === trimmed.toLowerCase(),
            );

            if (bookMatches.length > 1 || !isExactFullName) {
                // If it matches multiple books partially, or isn't an exact full name, suggest the names
                return Array.from(
                    new Set(bookMatches.map((b) => b.name)),
                ).slice(0, 10);
            }
        }

        // 2. Handle cases like "1 Cor" where there's a space within the book name
        if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
            const potentialBookName = `${parts[0]} ${parts[1]}`;
            const startMatches = allBooks.filter(
                (b) =>
                    b.name
                        .toLowerCase()
                        .startsWith(potentialBookName.toLowerCase()) ||
                    b.aliases.some((a) =>
                        a
                            .toLowerCase()
                            .startsWith(potentialBookName.toLowerCase()),
                    ),
            );
            if (startMatches.length > 0 && parts.length === 2) {
                return Array.from(
                    new Set(startMatches.map((b) => b.name)),
                ).slice(0, 10);
            }
        }

        // 3. If a full book is identified, suggest chapters or verses
        let book: Book | null = null;
        let referenceContent = '';

        // Re-check book identification similar to parseReference
        if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
            book = Book.findByName(`${parts[0]} ${parts[1]}`);
            if (book) referenceContent = parts.slice(2).join(' ');
        }
        if (!book) {
            book = Book.findByName(parts[0]);
            if (book) referenceContent = parts.slice(1).join(' ');
        }

        if (book) {
            // Use the actual name from the input if it's a valid alias, otherwise use book.name
            let matchedName = book.name;
            const inputLower = parts[0].toLowerCase();
            if (book.aliases.some((a) => a.toLowerCase() === inputLower)) {
                // Try to find the alias that matches case-insensitively but use the original casing from the input?
                // Actually, let's just use the book's standard name for consistency in suggestions,
                // but if the user typed "Psalms" and it's an alias, use that.
                const aliasMatch = book.aliases.find(
                    (a) => a.toLowerCase() === inputLower,
                );
                if (aliasMatch) matchedName = aliasMatch;
            } else if (/^[1-3]$/.test(parts[0]) && parts.length > 1) {
                const twoPartLower = `${parts[0]} ${parts[1]}`.toLowerCase();
                const aliasMatch = book.aliases.find(
                    (a) => a.toLowerCase() === twoPartLower,
                );
                if (aliasMatch) matchedName = aliasMatch;
            }

            const prefix = matchedName + ' ';
            if (!referenceContent) {
                // Suggest first few chapters
                const suggestions = [];
                for (let i = 1; i <= Math.min(book.chapterCount, 10); i++) {
                    suggestions.push(`${prefix}${i}`);
                }
                return suggestions;
            }

            // Reference content exists (e.g., "John 3", "John 3:16")
            if (!referenceContent.includes(':')) {
                const chapterNum = parseInt(referenceContent, 10);

                // Prioritize completion if they are still typing the number
                const completions = [];
                for (let i = 1; i <= book.chapterCount; i++) {
                    if (
                        i.toString().startsWith(referenceContent) &&
                        i.toString() !== referenceContent
                    ) {
                        completions.push(`${prefix}${i}`);
                        if (completions.length >= 10) break;
                    }
                }

                if (completions.length > 0) return completions;

                if (
                    !isNaN(chapterNum) &&
                    book.isValidChapter(chapterNum, system)
                ) {
                    // It's a valid chapter, suggest adding a colon for verses
                    return [`${prefix}${chapterNum}:`];
                }

                return [];
            } else {
                // Has a colon, e.g., "John 3:1"
                const colonParts = referenceContent.split(':');
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
                            if (
                                i.toString().startsWith(versePart) &&
                                i.toString() !== versePart
                            ) {
                                completions.push(`${prefix}${chapterNum}:${i}`);
                                if (completions.length >= 10) break;
                            }
                        }
                        if (completions.length > 0) return completions;

                        if (book.isValidVerse(chapterNum, verseNum, system)) {
                            // Valid verse, suggest range or another verse
                            return [
                                `${prefix}${chapterNum}:${verseNum}-`,
                                `${prefix}${chapterNum}:${verseNum},`,
                            ];
                        }
                    }
                }
            }
        }

        return [];
    }
}
