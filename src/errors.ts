/**
 * Base error class for all pericope-related errors
 */
export class PericopeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PericopeError';
    }
}

/**
 * Raised when an invalid book code or name is provided
 */
export class InvalidBookError extends PericopeError {
    constructor(bookInput: string) {
        super(`Invalid book: '${bookInput}'`);
        this.name = 'InvalidBookError';
    }
}

/**
 * Raised when an invalid chapter number is provided
 */
export class InvalidChapterError extends PericopeError {
    constructor(book: string, chapter: number) {
        super(`Invalid chapter ${chapter} for book ${book}`);
        this.name = 'InvalidChapterError';
    }
}

/**
 * Raised when an invalid verse number is provided
 */
export class InvalidVerseError extends PericopeError {
    constructor(book: string, chapter: number, verse: number) {
        super(`Invalid verse ${chapter}:${verse} for book ${book}`);
        this.name = 'InvalidVerseError';
    }
}

/**
 * Raised when an invalid range is provided
 */
export class InvalidRangeError extends PericopeError {
    constructor(rangeText: string) {
        super(`Invalid range: '${rangeText}'`);
        this.name = 'InvalidRangeError';
    }
}

/**
 * Raised when parsing fails
 */
export class ParseError extends PericopeError {
    constructor(text: string, reason?: string) {
        let message = `Failed to parse: '${text}'`;
        if (reason) {
            message += ` - ${reason}`;
        }
        super(message);
        this.name = 'ParseError';
    }
}
