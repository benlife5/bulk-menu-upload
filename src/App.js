import "./App.css";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import FuzzySet from "fuzzyset.js";
import OutputComponent from "./OutputComponent";

function App() {
  const [data, setData] = useState();
  const [ingredients, setIngredients] = useState(() => new Set());
  const [normalizedIngredientLookup, setNormalizedIngredientLookup] = useState(
    {}
  );
  const [fullMatches, setFullMatches] = useState();
  const [autoMatches, setAutoMatches] = useState();
  const [failedMatches, setFailedMatches] = useState();

  const loadIngredients = () => {
    fetch("ingredients_list.csv")
      .then((res) => res.text())
      .then((res) => Papa.parse(res).data)
      .then((data) => {
        const ingred = new Set();
        for (let i = 1; i < data.length; i++) {
          const normalizedIngredient = normalizeString(data[i][1]);
          ingred.add(normalizedIngredient);
        }
        setIngredients(() => ingred);
        console.log(normalizedIngredientLookup)
      });
  };

  const normalizeString = (str) => {
    const normalized = str.toLowerCase().trim().replaceAll(" ", "")
    if (normalizedIngredientLookup[normalized] === undefined) {
      const newLookup = normalizedIngredientLookup
      newLookup[normalized] = str
      setNormalizedIngredientLookup(newLookup)
    } 
    return normalized;
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    Papa.parse(e.target[0].files[0], {
      header: true,
      skipEmptyLines: "greedy",
      complete: function (results) {
        for (let i = 0; i < results.data.length; i++) {
          if (results.data[i]["Menu Title"] === "" && i > 0) {
            results.data[i]["Menu Title"] = results.data[i - 1]["Menu Title"];
          }
          if (results.data[i].Partner === "" && i > 0) {
            results.data[i].Partner = results.data[i - 1].Partner;
          }
          if (results.data[i].Meal === "" && i > 0) {
            results.data[i].Meal = results.data[i - 1].Meal;
          }
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

  const match = (input) => {
    const alreadyCorrect = [];
    const matched = [];
    const unableToMatch = [];
    const fuzzySet = FuzzySet(Array.from(ingredients));
    input.forEach((meal) => {
      const unMatchedIngredients = [];
      let fullSuccess = true;
      meal.outputIngredients = []
      meal.Ingredients.forEach((originalIngredient) => {
        const ingredient = normalizeString(originalIngredient)
        if (!ingredients.has(ingredient)) {
          fullSuccess = false;
          unMatchedIngredients.push(originalIngredient);
        } else {
          meal.outputIngredients.push(normalizeString(ingredient))
        }
      });
      if (fullSuccess) {
        alreadyCorrect.push(meal);
      } else {
        let allMatched = true;
        meal.unMatchableIngredients = [];
        meal.matchedIngredients = [];
        unMatchedIngredients.forEach((originalIngredient) => {
          const ingredient = normalizeString(originalIngredient)
          let fuzzySetResult = fuzzySet.get(ingredient);
          if (fuzzySetResult[0][0] < 0.5) {
            allMatched = false;
            meal.unMatchableIngredients.push(ingredient);
          } else {
            meal.outputIngredients.push(normalizeString(fuzzySetResult[0][1]))
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

  if (ingredients.size > 0) {
    return (
      <div className="App">
        <form onSubmit={(e) => upload(e)}>
          <input type="file" label="Upload file" />
          <input type="Submit" label="Upload" />
        </form>
        <OutputComponent recipeSet={fullMatches} title={"Full Matches"} lookup={normalizedIngredientLookup} />
        <OutputComponent recipeSet={autoMatches} title={"Auto Matches"} lookup={normalizedIngredientLookup}/>
        <OutputComponent recipeSet={failedMatches} title={"Unable to Match"} lookup={normalizedIngredientLookup}/>
      </div>
    );
  } else {
    return <div className="App">Loading</div>;
  }
}

export default App;
