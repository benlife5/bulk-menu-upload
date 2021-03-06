import "./App.css";
import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import FuzzySet from "fuzzyset.js";
import OutputComponent from "./OutputComponent";

function App() {
  const [ingredients, setIngredients] = useState(() => new Set());
  const [normalizedIngredientLookup, setNormalizedIngredientLookup] = useState({});
  const [fullMatches, setFullMatches] = useState();
  const [autoMatches, setAutoMatches] = useState();
  const [failedMatches, setFailedMatches] = useState();

  // Converts string into all lower-case, no punctuation, no spaces and stores both versions in an object
  const normalizeString = useCallback(
    (str) => {
      let normalized = str.toLowerCase().trim().replaceAll(" ", "");
      // regex from https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
      normalized = normalized.replaceAll(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""); // removes all punctuation
      normalized = normalized.replaceAll(/\s{2,}/g, " "); // removes extra spaces

      if (normalizedIngredientLookup[normalized] === undefined) {
        const newLookup = normalizedIngredientLookup;
        newLookup[normalized] = str;
        setNormalizedIngredientLookup(newLookup);
      }
      return normalized;
    },
    [normalizedIngredientLookup]
  );

  // Loads in all ingredients from ingredients_list.csv
  const loadIngredients = useCallback(() => {
    fetch("ingredients_list.csv")
      .then((res) => res.text())
      .then((res) => Papa.parse(res).data)
      .then((data) => {
        const ingred = new Set();
        for (let i = 1; i < data.length; i++) {
          const normalizedIngredient = normalizeString(data[i][1]);
          ingred.add(normalizedIngredient);
        }
        setIngredients(() => ingred);  // stores ingredients in a stateful Set
      });
  }, [normalizeString]);

  // Loads ingredients on component mount
  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  // Handles file upload by user
  const upload = async (e) => {
    e.preventDefault();  // no page refresh
    Papa.parse(e.target[0].files[0], {
      header: true,
      skipEmptyLines: "greedy",
      complete: function (results) {
        for (let i = 0; i < results.data.length; i++) {
          // fills in title/partner/meal if left blank
          if (results.data[i]["Menu Title"] === "" && i > 0) {
            results.data[i]["Menu Title"] = results.data[i - 1]["Menu Title"];
          }
          if (results.data[i].Partner === "" && i > 0) {
            results.data[i].Partner = results.data[i - 1].Partner;
          }
          if (results.data[i].Meal === "" && i > 0) {
            results.data[i].Meal = results.data[i - 1].Meal;
          }

          // Parses ingredients list
          results.data[i].Ingredients = Papa.parse(
            results.data[i].Ingredients
          ).data[0];
          results.data[i].normalizedIngredients = [];
          results.data[i].Ingredients.forEach((ingredient) => {
            const normalizedIngredient = normalizeString(ingredient);
            results.data[i].normalizedIngredients.push(normalizedIngredient);
          });
        }
        match(results.data);
      },
      error: function () {
        alert("Invalid file");
      },
    });
  };

  // performs the ingredient matching
  const match = (input) => {
    const alreadyCorrect = [];
    const matched = [];
    const unableToMatch = [];

    const fuzzySet = FuzzySet(Array.from(ingredients));

    input.forEach((meal) => {
      const unMatchedIngredients = [];
      let fullSuccess = true;
      meal.outputIngredients = [];

      // Determine if the ingredient is matches 1:1 or needs to be auto-matched
      meal.Ingredients.forEach((originalIngredient) => {
        const ingredient = normalizeString(originalIngredient);
        if (!ingredients.has(ingredient)) { // if the ingredient is not in the set, it will need to be auto-matched
          fullSuccess = false;
          unMatchedIngredients.push(originalIngredient);
        } else {  // if the ingredient is in the set, it is already matched
          meal.outputIngredients.push(normalizeString(ingredient));
        }
      });

      if (fullSuccess) {  // all ingredients matched 1:1
        alreadyCorrect.push(meal);
      } else {
        // Perform the auto-matching
        let allMatched = true;
        meal.unMatchableIngredients = [];
        meal.matchedIngredients = [];
        
        unMatchedIngredients.forEach((originalIngredient) => {
          const ingredient = normalizeString(originalIngredient);
          const fuzzySetResult = fuzzySet.get(ingredient);
          // auto-matching occurs if the fuzzy set result is > 0.5
          // This means that it is more likely to be a match than not
          // This number can be adjusted to calibrate the system
          if (fuzzySetResult[0][0] < 0.5) { // match failed, add to unMatchable
            allMatched = false;
            meal.unMatchableIngredients.push(ingredient);
          } else {  // match succeeded, store match
            meal.outputIngredients.push(normalizeString(fuzzySetResult[0][1]));
            meal.matchedIngredients.push({
              original: ingredient,
              matched: fuzzySetResult[0][1],
            });
          }
        });

        if (allMatched) {
          matched.push(meal);
        } else {
          unableToMatch.push(meal);
        }
      }
    });

    setFullMatches(alreadyCorrect);
    setAutoMatches(matched);
    setFailedMatches(unableToMatch);
  };

  // output
  if (ingredients.size > 0) {
    return (
      <div className="App">
        <form onSubmit={(e) => upload(e)}>
          <input type="file" label="Choose file" />
          <input type="Submit" label="Upload" value="Upload" />
        </form>
        <OutputComponent
          recipeSet={fullMatches}
          title={"Full Matches"}
          lookup={normalizedIngredientLookup}
        />
        <OutputComponent
          recipeSet={autoMatches}
          title={"Auto Matches"}
          lookup={normalizedIngredientLookup}
        />
        <OutputComponent
          recipeSet={failedMatches}
          title={"Unable to Match"}
          lookup={normalizedIngredientLookup}
        />
      </div>
    );
  } else {
    return <div className="App">Loading</div>;
  }
}

export default App;
