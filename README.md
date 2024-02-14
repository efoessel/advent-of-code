# Advent of code

Typescript, mostly functional programming style.
- Classes are allowed as long as they are only syntaxic sugar (no internal mutable state)
- Non-functional mutable blobs are allowed only if enclosed in a single function that behaves functionally from outside.

Exceptions to functional programming are mostly related to performance issue where copy-on-write would be catastrophic without very sophisticated data structures (path traversal with visited tracking, explore all small variations of a data structure...)

# Commands
## npm run example / npm run real

Runs the `run/index.ts` file on example or real data, watches any change & re-run the algo on save.  
What exactly is run depends on the content of the file, it contains what is required to easily run a day / a year.
Trying to run a day that doesn't exist will create the daily directory with empty inputs & template ts.

For now, each year run in a few tens of seconds.

## npm lint

Runs all 'archived' days (year is hardcoded)  
Watches changes & re-run all on save.  
Intended for non-regression when updating the libs

# Requirement

Puzzle inputs are not in the repo, as per the author's request.  
To work, each day must have its files for examples and / or real puzzle.  
Never keep an empty line at the end of the input (there should be a warning when it happens)

Examples are usually the main example from the puzzle description, or several when applicable.  
Base name is usually example-data, but it may be example1-data or similar (the 3rd param of runStep is whatever is expected before the '-data')  
It should be reasonably easy to guess which input is expected in which file.  
Sometimes, they may be example that I manually crafted to test (that you can't easily reproduce)

Real input are always named 'real-data'. You should copy-paste your input there.
