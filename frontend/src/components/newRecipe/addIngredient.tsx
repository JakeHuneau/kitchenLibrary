import * as React from "react";
import * as Blueprint from "@blueprintjs/core";
import {IngredientSelect} from "../util/IngredientSelect";
import {handleBooleanChange, handleStringChange} from "@blueprintjs/docs-theme";
import "./addIngredient.scss";

interface Props {
    label: string;
    possibleIngredients: string[];
    ingredient: string;
    setIngredient: (ingredient: string) => void;
    amount: number;
    setAmount: (amount: number) => void;
    unit: string;
    setUnit: (unit: string) => void;
    required: boolean;
    setRequired: (required: boolean) => void;
    canDelete: boolean;
    onDelete: () => void;
}

const COMPONENT_NAME = "AddIngredient";


export const AddIngredient: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <div className={COMPONENT_NAME}>
            {props.label} <IngredientSelect
            possibleIngredients={props.possibleIngredients}
            selectedIngredients={[props.ingredient]}
            setSelectedIngredients={(ingredients) => props.setIngredient(ingredients[1])}
            canAdd={true}
            suggest={true}
        />
        <Blueprint.NumericInput
            placeholder={"amount"}
            value={props.amount}
            onValueChange={(newValue) => props.setAmount(newValue)}
            stepSize={0.25}
            minorStepSize={0.01}
            min={0}
        />
        <Blueprint.InputGroup
            placeholder={"unit"}
            value={props.unit}
            onChange={handleStringChange((newUnit) => props.setUnit(newUnit))}
        />
        Required:
        <Blueprint.Checkbox
            checked={props.required}
            large={true}
            onChange={handleBooleanChange((newValue) => props.setRequired(newValue))}
        />
            {props.canDelete ? <Blueprint.Button icon={"cross"} onClick={props.onDelete} /> : <div/>}
        </div>
    );
}

AddIngredient.displayName = COMPONENT_NAME