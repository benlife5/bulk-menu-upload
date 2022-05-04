import './App.css';
import {useState, useEffect} from "react"
import Papa from "papaparse";

function App() {
  const [data, setData] = useState()
  const [ingredients, setIngredients] = useState(() => new Set())

  const loadIngredients = () => {
    fetch("ingredients_list.csv")
    .then(res => res.text())
    .then(res => Papa.parse(res).data)
    .then(data => {
      const ingred = new Set()
      for (let i = 1; i < data.length; i++) {
        // console.log(data[i][1])
        ingred.add(data[i][1].toLowerCase().trim().replaceAll(" ", ""))
      }
      // console.log(ingred)
      setIngredients(() => ingred)
    })
  }

  useEffect(() => {
    loadIngredients()
  }, []);
  
  console.log(ingredients)
  console.log(ingredients.has("Farro".toLowerCase()))
  if (ingredients.size > 0) {
    return (
      <div className="App">
        {"Test"}
        {ingredients}
      </div>
    );
  } else {
    return (<div className="App">Loading</div>)
  }
}

export default App;
