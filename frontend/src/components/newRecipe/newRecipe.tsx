import * as React from "react";
import {useState} from "react";
import * as Blueprint from "@blueprintjs/core";
import "./newRecipes.scss"
import {handleStringChange} from "@blueprintjs/docs-theme";
import {Api, IngredientInfo} from "../../api/Api";
import {AddIngredient} from "./addIngredient";
import {Toaster} from "../../KitchenLibrary";

interface Props {
    userId: string | undefined;
    possibleIngredients: string[];
}

const COMPONENT_NAME = "NewRecipe";


/**
 * View for adding a new recipe
 */
export const NewRecipe: React.FunctionComponent<Props> = (props) => {
    const [recipeName, setRecipeName] = useState("");
    const [ingredients, setIngredients] = useState<IngredientInfo[]>([
        {
            name: "",
            quantity: 1.0,
            unit: "",
            required: true
        }
    ]);
    const [directions, setDirections] = useState("");

    if (props.userId === undefined) {
        return <div>
            You should not be here, please make an account.
        </div>
    }

    return (
        <div className={COMPONENT_NAME}>
            <h2>New Recipe</h2>
            <div className={`${COMPONENT_NAME}__name`}>
                <u>Recipe Name</u>
                <br/>
                <br/>
                <Blueprint.InputGroup
                    value={recipeName}
                    onChange={handleStringChange((newName) => setRecipeName(newName))}
                />
                <br/>
                <br/>
                <div className={`${COMPONENT_NAME}__ingredients`}>
                    <u>Ingredients</u>
                    <br/>
                    <br/>
                    {
                        ingredients.map((ingredient, index) => {
                            return <AddIngredient
                                label={`${index + 1}: `}
                                possibleIngredients={props.possibleIngredients}
                                ingredient={ingredient.name}
                                setIngredient={(newIngredient: string) => {
                                    const tempIngredients = [...ingredients];
                                    tempIngredients[index].name = newIngredient;
                                    setIngredients(tempIngredients);
                                }}
                                amount={ingredient.quantity}
                                setAmount={(newAmount: number) => {
                                    const tempIngredients = [...ingredients];
                                    tempIngredients[index].quantity = newAmount;
                                    setIngredients(tempIngredients);
                                }}
                                unit={ingredient.unit}
                                setUnit={(newUnit: string) => {
                                    const tempIngredients = [...ingredients];
                                    tempIngredients[index].unit = newUnit;
                                    setIngredients(tempIngredients);
                                }}
                                required={ingredient.required}
                                setRequired={(isRequired: boolean) => {
                                    const tempIngredients = [...ingredients];
                                    tempIngredients[index].required = isRequired;
                                    setIngredients(tempIngredients);
                                }}
                                canDelete={index > 0}
                                onDelete={() => {
                                    const tempIngredients = [...ingredients];
                                    tempIngredients.splice(index, 1);
                                    setIngredients(tempIngredients);
                                }}
                            />;
                        })
                    }
                    <br/>
                    <br/>
                    <Blueprint.Button
                        icon={"add"}
                        onClick={() => {
                            const tempIngredients = [...ingredients];
                            tempIngredients.push({
                                name: "",
                                quantity: 0,
                                unit: "",
                                required: true
                            });
                            setIngredients(tempIngredients)
                        }}
                    >
                        Add Ingredient
                    </Blueprint.Button>
                    <br/>
                    <br/>
                </div>
                <div className={`${COMPONENT_NAME}__directions`}>
                    <u>Directions</u>
                    <br/>
                    <br/>
                    <Blueprint.TextArea
                        value={directions}
                        onChange={handleStringChange((newDirections) => setDirections(newDirections))}
                        growVertically={true}
                    />
                </div>
                <div className={`${COMPONENT_NAME}__buttons`}>
                    <Blueprint.Button
                        onClick={() => {
                            Api.Recipe.addRecipe({
                                name: recipeName,
                                directions: directions,
                                ingredients: ingredients
                            }, props.userId!).then((result) => {
                                if (result.success) {
                                    Toaster.show({
                                        intent: Blueprint.Intent.SUCCESS,
                                        message: `Added ${recipeName}`,
                                        timeout: 2000
                                    });
                                } else {
                                    Toaster.show({
                                        intent: Blueprint.Intent.DANGER,
                                        message: `Failed to add ${recipeName}`,
                                        timeout: 2000
                                    });
                                    console.log(result.message);
                                }
                            })
                        }}
                    >
                        Save
                    </Blueprint.Button>
                </div>
            </div>
        </div>
    );
};

NewRecipe.displayName = COMPONENT_NAME;
