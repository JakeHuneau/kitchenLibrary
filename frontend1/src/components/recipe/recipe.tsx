import * as React from "react";
import {useState} from "react";
import * as Blueprint from "@blueprintjs/core";
import "./recipe.scss"
import {FullRecipe} from "../../api/Api";


interface Props {
    recipe: FullRecipe
}

const COMPONENT_NAME = "Recipe"

/**
 * Shows a card for a recipe
 */
export const Recipe: React.FunctionComponent<Props> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={COMPONENT_NAME}>
            <Blueprint.Card
                elevation={Blueprint.Elevation.TWO}
                interactive={true}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2>{props.recipe.recipe_info.name}</h2>
                {
                    isOpen && <div className={`${COMPONENT_NAME}__body`}>
                        <div className={`${COMPONENT_NAME}__ingredients`}>
                            <u>Ingredients</u>
                            {
                                props.recipe.ingredients.map((ingredient) => {
                                    return <div
                                        key={ingredient.name}
                                        className={`${COMPONENT_NAME}__ingredient`}
                                    >
                                        {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                                        {ingredient.required ? "" : "[Optional]"}
                                    </div>
                                })
                            }
                        </div>
                        <br/>
                        <div className={`${COMPONENT_NAME}__directions`}>
                            <u>Directions</u>
                            <div className={`${COMPONENT_NAME}__directions`}>
                                {props.recipe.recipe_info.directions}
                            </div>
                        </div>
                    </div>
                }
            </Blueprint.Card>
            <br/>
        </div>
    );
}

Recipe.displayName = COMPONENT_NAME;