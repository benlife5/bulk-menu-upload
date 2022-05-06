# Bulk Menu Upload - Parkday Project - Ben Life
## May 2022

## Approach
My first goal was to import the ingredient list CSV and accept the user's upload CSV. Once I had those two files as variables, I knew I could work with the data to find matches. I processed the ingredients list into a Set object and parsed up the user upload into a regular object. I also normalized the strings by removing whitespace, punctuation, and capital letters so that matching could occur easier. I created a dictionary of normalized string to original string so that the output could display both.

After processing the input, I turned my attention to the matching process. First, I did a simple lookup in the ingredient Set to see if there was a direct match. Any ingredients that were found were moved into the matched category. If all ingredients were found, that meal was moved to the fully matched category. If there were ingredients that could not be directly matched, a fuzzy search was attempted. The search returned values between 0 and 1 and if the value was > 0.5, the system accepted it as a match because it was more likely than not to be a match. Meals were then split into auto-matched (all ingredients found directly or through the fuzzy search) or unable to match (at least one un-matchable ingredient)

Finally, I displayed the outcome in a table.

## Time Estimates

| Task | Estimated | Actual | Notes |
| ---- | --------- | ------ | ----- |
| Create repo | 10 min | 5 min | |
| Import ingredients.csv into set | 15 min | 45 min | Was unfamiliar with importing local csv files into JS, parsing CSVs in JS, and Set objects so this took more time than expected |
| Accept user input and parse CSV | 20 min | 15 min | Went smoother after learning the local import |
| Build ingredient checker | 1 hr | 45 min | the FuzzySet package made this a lot easier |
| Output results | 30 min | 30 min | This took longer than ideal -- had some trouble getting all the data I wanted in the right place |
| Wrap-up | 30 min | 30 min | Added a few small things and did some important code cleanup |

## Challenges

Going between the normalized versions of the strings and the original versions was more complicated than expect. I wanted to keep both but storing them both took some effort

Also, just generally, I was still getting familiar with various JS and React functionality, so syntax/architecture sometimes slowed me down, but I could feel myself getting more comfortable/faster as the project progressed.

## Possible Improvements

The system could benefit from calibration with different typical inputs. Changing the string normalization process as well as the fuzzy match threshold could affect how many ingredients directly match or match through the fuzzy search. The user could provide feedback on whether the matching should be more or less aggressive.

Another possible addition could be a CSV download containing all of the un-matchable meals. It would then be very easy for the user to fix the broken ingredients and try again.

## Packages Used

[PapaParse](https://www.papaparse.com) - Used to parse the CSV files (MIT License)

[fuzzySet.js](http://glench.github.io/fuzzyset.js/) Used to perform the fuzzy searches (PPL License -- might want to replace with similar library if used in commercial product)