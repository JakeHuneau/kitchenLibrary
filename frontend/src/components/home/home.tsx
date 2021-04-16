import * as React from "react";
import {useState} from "react";
import * as Blueprint from "@blueprintjs/core";
import "./home.scss"
import {Api, FullRecipe} from "../../api/Api";
import {Recipe} from "../recipe/recipe";
import {IngredientSelect} from "../util/IngredientSelect";

interface Props {
    possibleIngredients: string[]
}

const COMPONENT_NAME = "Home"

export const Home: React.FunctionComponent<Props> = (props) => {
    const [selectedIngredients, setIngredients] = useState<string[]>([]);
    const [foundRecipes, setFoundRecipes] = useState<FullRecipe[]>([]);

    return (
        <div className={COMPONENT_NAME}>
            Welcome to Kitchen Library!
            <br/>
            <br/>
            Add some ingredients and see what you can make!
            <br/>
            <br/>
            <IngredientSelect
                possibleIngredients={props.possibleIngredients}
                selectedIngredients={selectedIngredients}
                setSelectedIngredients={setIngredients}
            />
            <br/>
            <Blueprint.Button onClick={() => {
                Api.Recipe.getMatchingRecipes(selectedIngredients)
                    .then((result) => {
                        if (!result.success) {
                            console.log(result)
                        } else {
                            setFoundRecipes(result.data);
                        }
                    })
            }}>
                Search for recipes
            </Blueprint.Button>
            <br/>
            <br/>
            <div className={`${COMPONENT_NAME}__recipes`}>
                {foundRecipes.map((recipe) => <Recipe recipe={recipe}/>)}
            </div>
        </div>
    )
}

Home.displayName = COMPONENT_NAME;