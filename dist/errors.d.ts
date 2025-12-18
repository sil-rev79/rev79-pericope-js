/**
 * Base error class for all pericope-related errors
 */
export declare class PericopeError extends Error {
    constructor(message: string);
}
/**
 * Raised when an invalid book code or name is provided
 */
export declare class InvalidBookError extends PericopeError {
    constructor(bookInput: string);
}
/**
 * Raised when an invalid chapter number is provided
 */
export declare class InvalidChapterError extends PericopeError {
    constructor(book: string, chapter: number);
}
/**
 * Raised when an invalid verse number is provided
 */
export declare class InvalidVerseError extends PericopeError {
    constructor(book: string, chapter: number, verse: number);
}
/**
 * Raised when an invalid range is provided
 */
export declare class InvalidRangeError extends PericopeError {
    constructor(rangeText: string);
}
/**
 * Raised when parsing fails
 */
export declare class ParseError extends PericopeError {
    constructor(text: string, reason?: string);
}
