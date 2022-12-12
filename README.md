# Advent of code
## 2022
Typescript, mostly functional programming style.
- Classes are allowed as long as they are only syntaxic sugar (no internal mutable state)
- Non-functional mutable blobs are allowed only if enclosed in a single function that behaves functionally from outside.

# Commands
## npm run example / npm run real

Runs the `today` file on example or real data.  
Watches any change & re-run the algo on save.  
Main speed-run commands

## npm test

Runs all 'archived' days (year is hardcoded)  
Watches changes & re-run all on save.  
Intended for non-regression when updating the libs

## npm run scores
Requires the /scores/score-data file to contain the json from the aoc API (https://adventofcode.com/${year}/leaderboard/private/view/${leaderBoardId}.json).  
Prints:
- the time each user required to finish each day's problem
- the ranking for each day for the first star & the time required by each user
- the ranking for each day for the second star & the time required by each user

## ts-node ./any/file/dot.ts -- blah

Runs the file (obviously)  
If you use the assert or run method, the data used will be from the `blah-data` file  
May be useful to run some other tests