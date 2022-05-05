import './App.css';
import {useState, useEffect} from "react"
import Papa from "papaparse";
import FuzzySet from 'fuzzyset.js';

function App() {
  const [data, setData] = useState()
  const [ingredients, setIngredients] = useState(() => new Set())
  const [normalizedIngredientLookup, setNormalizedIngredientLookup] = useState({})
  const [fullMatches, setFullMatches] = useState()
  const [autoMatches, setAutoMatches] = useState()
  const [failedMatches, setFailedMatches] = useState()
  // const [input, setInput] = useState()

  const loadIngredients = () => {
    fetch("ingredients_list.csv")
    .then(res => res.text())
    .then(res => Papa.parse(res).data)
    .then(data => {
      const ingred = new Set()
      const normalizedIngredients = {}
      for (let i = 1; i < data.length; i++) {
        const normalizedIngredient = normalizeString(data[i][1])
        ingred.add(normalizedIngredient)
        normalizedIngredients[normalizedIngredient] = data[i][1]
      }
      setNormalizedIngredientLookup(() => normalizedIngredients)
      setIngredients(() => ingred)
    })
  }

  const normalizeString = (str) => {
    return str.toLowerCase().trim().replaceAll(" ", "")
  }

  useEffect(() => {
    loadIngredients()
  }, []);

  const upload = async (e) => {
    e.preventDefault()
    Papa.parse(e.target[0].files[0], {
      header: true,
      skipEmptyLines: "greedy",
      complete: function (results) {
        for (let i = 0; i < results.data.length; i++) {
          if (results.data[i]["Menu Title"] === "" && i > 0) {
            results.data[i]["Menu Title"] = results.data[i - 1]["Menu Title"]
          }
          if (results.data[i].Partner === "" && i > 0) {
            results.data[i].Partner = results.data[i - 1].Partner
          }
          if (results.data[i].Meal === "" && i > 0) {
            results.data[i].Meal = results.data[i - 1].Meal
          }
          results.data[i].Ingredients = Papa.parse(results.data[i].Ingredients).data[0]
          results.data[i].normalizedIngredients = []
          results.data[i].normalizedIngredientLookup = {}
          results.data[i].Ingredients.forEach(
            (ingredient) => {
              const normalizedIngredient = normalizeString(ingredient)
              results.data[i].normalizedIngredients.push(normalizedIngredient)
            }
          )
        }
        
        console.log(results.data)
        // setInput(results.data)
        match(results.data)
      },
      error: function () {alert("Invalid file")}
    });
  }

  const match = (input) => {
    console.log(input)
    const alreadyCorrect = []
    const matched = []
    const unableToMatch = []
    const fuzzySet = FuzzySet(Array.from(ingredients))
    input.forEach ((meal) => {
      const unMatchedIngredients = []
      let fullSuccess = true
      meal.normalizedIngredients.forEach((ingredient) => {
        if (!ingredients.has(ingredient)) {
          fullSuccess = false
          unMatchedIngredients.push(ingredient)
        }
      })
      if (fullSuccess) {
        alreadyCorrect.push(meal)
      } else {
        let allMatched = true
        meal.unMatchableIngredients = []
        meal.matchedIngredients = []
        unMatchedIngredients.forEach((ingredient) => {
          let fuzzySetResult = fuzzySet.get(ingredient)
          console.log(ingredient, fuzzySetResult)
          if (fuzzySetResult[0][0] < 0.5) {
            allMatched = false
            meal.unMatchableIngredients.push(ingredient)
          } else {
            meal.matchedIngredients.push({original: ingredient, matched: fuzzySetResult[0][1]})
          }
        })
        if (allMatched) {
          matched.push(meal)
        } else {
          unableToMatch.push(meal)
        }
      }
    })
    console.log("succesful:", alreadyCorrect)
    console.log("matched:", matched)
    console.log("unsuccesful:", unableToMatch)

    setFullMatches(alreadyCorrect)
    setAutoMatches(matched)
    setFailedMatches(unableToMatch)
  }
  
  console.log(ingredients)
  console.log(normalizedIngredientLookup)
  console.log("fullMatches", fullMatches)
  if (ingredients.size > 0) {
    return (
      <div className="App">
        <form onSubmit={(e) => upload(e)}>
          <input type="file" label="Upload file" />
          <input type="Submit" label="Upload"/>
        </form>
        <table><tbody>
          <tr><td>Full Matches</td></tr>
        {fullMatches && fullMatches.length > 0 && fullMatches.map(
          (meal) => {
            return (<tr>
              <td>{meal["Menu Title"]}</td>
              <td>{meal["Partner"]}</td>
              <td>{meal["Meal"]}</td>
              <td>{meal.Ingredients}</td>
            </tr>)
          }
        )}
        </tbody></table>
      </div>
    );
  } else {
    return (<div className="App">Loading</div>)
  }
}

export default App;
