import './App.css';
import {useState, useEffect} from "react"
import Papa from "papaparse";

function App() {
  const [data, setData] = useState()
  const [ingredients, setIngredients] = useState(() => new Set())
  const [input, setInput] = useState()

  const loadIngredients = () => {
    fetch("ingredients_list.csv")
    .then(res => res.text())
    .then(res => Papa.parse(res).data)
    .then(data => {
      const ingred = new Set()
      for (let i = 1; i < data.length; i++) {
        ingred.add(data[i][1].toLowerCase().trim().replaceAll(" ", ""))
      }
      setIngredients(() => ingred)
    })
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
          results.data[i].Ingredients.forEach(
            (ingredient) => results.data[i].normalizedIngredients.push(ingredient.toLowerCase().trim().replaceAll(" ", ""))
          )
        }
        
        console.log(results.data)
        setInput(results.data)
      },
      error: function () {alert("Invalid file")}
    });
  }
  
  console.log(ingredients)
  if (ingredients.size > 0) {
    return (
      <div className="App">
        <form onSubmit={(e) => upload(e)}>
          <input type="file" label="Upload file" />
          <input type="Submit" label="Upload"/>
        </form>
      </div>
    );
  } else {
    return (<div className="App">Loading</div>)
  }
}

export default App;
