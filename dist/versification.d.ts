export interface ChapterInfo {
    bookCode: string;
    chapter: number;
    verseCount: number;
}
export type VersificationSystem = 'english';
export declare const ENGLISH: Record<string, number[]>;
export declare class Versification {
    /**
     * Returns chapter information (including verse count) for a specific book and chapter.
     */
    static chapterInfo(bookCode: string, chapter: number, system?: VersificationSystem): ChapterInfo | undefined;
    /**
     * Returns an array of ChapterInfo for all chapters in a book.
     */
    static bookChapters(bookCode: string, system?: VersificationSystem): ChapterInfo[];
    /**
     * Returns the total number of verses in a specific chapter.
     */
    static verseCount(bookCode: string, chapter: number, system?: VersificationSystem): number | undefined;
    /**
     * Returns the total number of verses in an entire book.
     */
    static totalVerses(bookCode: string, system?: VersificationSystem): number | undefined;
    static isValidChapter(bookCode: string, chapter: number, system?: VersificationSystem): boolean;
    static isValidVerse(bookCode: string, chapter: number, verse: number, system?: VersificationSystem): boolean;
}
