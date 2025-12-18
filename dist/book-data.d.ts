export type Testament = 'old' | 'new';
export interface BookInfo {
    code: string;
    number: number;
    name: string;
    testament: Testament;
    chapterCount: number;
    aliases: string[];
}
export declare const OLD_TESTAMENT_BOOKS: BookInfo[];
export declare const NEW_TESTAMENT_BOOKS: BookInfo[];
export declare const ALL_BOOKS: BookInfo[];
export declare const BOOKS_BY_CODE: Record<string, BookInfo>;
export declare const BOOKS_BY_NUMBER: Record<number, BookInfo>;
export declare const ALIAS_TO_BOOK: Record<string, BookInfo>;
