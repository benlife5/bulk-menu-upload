const OutputComponent = (props) => {
  return(<table>
    <thead>
      <tr>
        <th colSpan="8">{props.title}</th>
      </tr>
      <tr>
        <th>Menu Title</th>
        <th>Partner</th>
        <th>Meal</th>
        <th>Dish Name(s)</th>
        <th>Ingredients Received</th>
        <th>Matched Ingredients</th>
        {(props.title === "Auto Matches" || props.title === "Unable to Match") && <th>Auto-Matches</th>}
        {props.title === "Unable to Match" && <th>Un-Matchable Ingredients</th>}
      </tr>
    </thead>
    <tbody>
      {props.recipeSet &&
        props.recipeSet.length > 0 &&
        props.recipeSet.map((meal) => {
          return (
            <tr>
              <td>{meal["Menu Title"]}</td>
              <td>{meal["Partner"]}</td>
              <td>{meal["Meal"]}</td>
              <td>{meal["Dish Name(s)"]}</td>
              <td>{meal.Ingredients.join(", ")}</td>
              <td>{meal.outputIngredients.map((normIngred, index) => props.lookup[normIngred] + (index !== meal.outputIngredients.length - 1? ", " : ""))}</td>
              {(props.title === "Auto Matches" || props.title === "Unable to Match") && <td>
                  {meal.matchedIngredients.map((match) => <p>{props.lookup[match.original]} to {props.lookup[match.matched]}</p>)}
                </td>}
              {(props.title === "Unable to Match") && <td>
                  {meal.unMatchableIngredients.map((ingredient, index) => props.lookup[ingredient] + (index !== meal.unMatchableIngredients.length - 1? ", " : ""))}
                </td>}  
            </tr>
          );
        })}
    </tbody>
  </table>);
};

export default OutputComponent;