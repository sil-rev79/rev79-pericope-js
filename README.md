# rev79-pericope-js

A TypeScript library for parsing, manipulating, and formatting biblical scripture references and ranges (pericopes).

**This library is a TypeScript port of the [rev79-pericope](https://github.com/sil-rev79/rev79-pericope) Ruby gem.**

## Features

- **Robust Parsing**: Parse complex scripture references like `Genesis 1:1-3,5`, `MAT 5:3-12`, or `1 Corinthians 13`.
- **Fuzzy Matching**: Intelligent book name matching (e.g., "Genisis" matches "Genesis").
- **Set Operations**: Perform unions, intersections, and subtractions on scripture ranges.
- **Mathematical Utilities**: Calculate verse density, identify gaps in ranges, and split ranges into continuous segments.
- **Flexible Formatting**: Format pericopes in canonical (`GEN 1:1`), full name (`Genesis 1:1`), or abbreviated styles.
- **Versification Support**: Accurate chapter and verse counts for the English Bible.

## Basic Usage

### Parsing and Formatting

```typescript
import { Pericope } from '@sil-rev79/rev79-pericope-js';

// Parse a reference string
const p = new Pericope("Genesis 1:1-10, 15, 20-25");

console.log(p.toString()); // "GEN 1:1-10,15,20-25"
console.log(p.toString('full_name')); // "Genesis 1:1-10,15,20-25"

// Check properties
console.log(p.verseCount()); // 22
console.log(p.chapterList()); // [1]
console.log(p.isSingleChapter()); // true
```

### Extraction from Text

```typescript
import { Pericope } from '@sil-rev79/rev79-pericope-js';

const text = "Read John 3:16 and then look at Psalm 23.";
const pericopes = Pericope.parse(text);

console.log(pericopes[0].toString()); // "JHN 3:16"
console.log(pericopes[1].toString()); // "PSA 23:1"
```

### Set Operations

```typescript
const range1 = new Pericope("GEN 1:1-10");
const range2 = new Pericope("GEN 1:5-15");

const union = range1.union(range2);
console.log(union.toString()); // "GEN 1:1-15"

const intersection = range1.intersection(range2);
console.log(intersection.toString()); // "GEN 1:5-10"

const diff = range1.subtract(range2);
console.log(diff.toString()); // "GEN 1:1-4"
```

### Advanced Operations

```typescript
const p = new Pericope("GEN 1:1,3,5");

// Identify gaps
const gaps = p.gaps();
console.log(gaps.map(v => v.toString())); // ["GEN 1:2", "GEN 1:4"]

// Expand range
const expanded = p.expand(1, 1);
console.log(expanded.toString()); // "GEN 1:1-6" (Notice gaps are filled and boundaries expanded)

// Continuous segments
const multipart = new Pericope("GEN 1:1-3, 1:10-12");
const continuous = multipart.continuousRanges();
console.log(continuous.map(c => c.toString())); // ["GEN 1:1-3", "GEN 1:10-12"]
```

## Comparisons

```typescript
const p1 = new Pericope("GEN 1:1-5");
const p2 = new Pericope("GEN 1:6-10");

console.log(p1.intersects(p2)); // false
console.log(p1.isAdjacentTo(p2)); // true
console.log(p1.precedes(p2)); // true
```

## Error Handling

The library provides specific error classes for different failure modes:

```typescript
import { Pericope, InvalidBookError, InvalidChapterError } from 'rev79-pericope-js';

try {
  new Pericope("INVALID 1:1");
} catch (e) {
  if (e instanceof InvalidBookError) {
    console.log(e.message); // "Invalid book: INVALID"
  }
}

try {
  new Pericope("GEN 99:1");
} catch (e) {
  if (e instanceof InvalidChapterError) {
    console.log(e.message); // "Invalid chapter 99 for book GEN"
  }
}
```

## License

MIT
