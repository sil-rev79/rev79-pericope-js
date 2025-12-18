import { describe, it, expect } from 'vitest';
import { TextProcessor } from '../src/text-processor.js';

describe('TextProcessor', () => {
    describe('suggestCompletions', () => {
        it('suggests common books for empty input', () => {
            const suggestions = TextProcessor.suggestCompletions('');
            expect(suggestions).toContain('Genesis');
            expect(suggestions).toContain('Matthew');
        });

        it('suggests book names for partial input', () => {
            const suggestions = TextProcessor.suggestCompletions('Gen');
            expect(suggestions).toContain('Genesis');
        });

        it('handles case-insensitive partial book matching', () => {
            const suggestions = TextProcessor.suggestCompletions('mat');
            expect(suggestions).toContain('Matthew');
        });

        it('handles books starting with numbers', () => {
            const suggestions = TextProcessor.suggestCompletions('1 Co');
            expect(suggestions).toContain('1 Corinthians');
        });

        it('suggests chapters for a full book name', () => {
            const suggestions = TextProcessor.suggestCompletions('John');
            expect(suggestions).toContain('John 1');
            expect(suggestions).toContain('John 2');
        });

        it('suggests colon after a full chapter number', () => {
            const suggestions = TextProcessor.suggestCompletions('John 3');
            expect(suggestions).toEqual(['John 3:']);
        });

        it('suggests verses after a colon', () => {
            const suggestions = TextProcessor.suggestCompletions('John 3:');
            expect(suggestions).toContain('John 3:1');
            expect(suggestions).toContain('John 3:16');
        });

        it('suggests range or comma after a full verse', () => {
            const suggestions = TextProcessor.suggestCompletions('John 3:16');
            expect(suggestions).toContain('John 3:16-');
            expect(suggestions).toContain('John 3:16,');
        });

        it('completes partial chapters', () => {
            const suggestions = TextProcessor.suggestCompletions('Psalm 11');
            expect(suggestions).toContain('Psalm 119');
        });

        it('suggests colon for complete chapter if no further completions', () => {
            const suggestions = TextProcessor.suggestCompletions('John 3');
            expect(suggestions).toEqual(['John 3:']);
        });

        it('completes partial verses', () => {
            const suggestions = TextProcessor.suggestCompletions('John 3:1');
            // John 3 has verses 10-19, so "1" should suggest those first.
            expect(suggestions).toContain('John 3:10');
            expect(suggestions).not.toContain('John 3:1-');
        });

        it('suggests range/comma for complete verse if no further completions', () => {
            const suggestions = TextProcessor.suggestCompletions('John 3:16');
            expect(suggestions).toContain('John 3:16-');
            expect(suggestions).toContain('John 3:16,');
        });
    });
});
