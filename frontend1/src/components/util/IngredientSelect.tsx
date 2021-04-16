import * as React from "react";
import * as BlueprintSelect from "@blueprintjs/select"
import {ItemPredicate, ItemRenderer} from "@blueprintjs/select"
import _ from "lodash";
import * as Blueprint from "@blueprintjs/core";


/**
 * Props for {@link IngredientSelect}
 */
interface Props {
    possibleIngredients: string[]
    selectedIngredients: string[],
    setSelectedIngredients: (ingredients: string[]) => void;
    suggest?: boolean;
    canAdd?: boolean;
}

const COMPONENT_NAME = "IngredientSelect";


export const IngredientSelect: React.FunctionComponent<Props> = (props: Props) => {
    /**
     * Shows an ingredient
     */
    const renderIngredient: ItemRenderer<string> =
        (item, {handleClick, modifiers}) => {
            if (!modifiers.matchesPredicate) {
                return null;
            }
            return <Blueprint.MenuItem
                active={false}
                key={item}
                onClick={handleClick}
                text={item}
                shouldDismissPopover={false}
            />;
        };

    /**
     * Removes an ingredient
     */
    const removeIngredient = (ingredient: string) => {
        let tempIngredients = [...props.selectedIngredients]
        const itemIndex = _.findIndex(tempIngredients, ingredient);
        tempIngredients.splice(itemIndex, 1);
        props.setSelectedIngredients(tempIngredients);
    };

    /**
     * Filters for ingredients
     */
    const filterIngredient: ItemPredicate<string> =
        (query, ingredient, _index, exactMatch) => {
            const normalizedIngredient = ingredient.toLowerCase();
            const normalizedQuery = query.toLowerCase();

            if (exactMatch) {
                return normalizedIngredient === normalizedQuery
            } else {
                return normalizedIngredient.indexOf(normalizedQuery) >= 0;
            }
        };

    /**
     * Saves a new ingredient
     */
    const createIngredient = (name: string) => {
        return name;
    };

    /**
     * Renders a text for adding a new ingredient
     */
    const renderCreateIngredient = (
        query: string,
        active: boolean,
        handleClick: React.MouseEventHandler<HTMLElement>,
    ) => {
        if (_.indexOf(props.possibleIngredients, query) !== -1) {
            return undefined;
        }
        return (
            <Blueprint.MenuItem
                icon={"add"}
                text={`Add ${query}`}
                active={active}
                onClick={handleClick}
                shouldDismissPopover={false}
            />);
    };

    /**
     * Handles when the user selects an ingredient
     */
    const onIngredientSelect = (ingredient: string) => {
        let tempIngredients = [...props.selectedIngredients]
        tempIngredients = tempIngredients.concat(ingredient);
        props.setSelectedIngredients(tempIngredients);
    }

    if (props.suggest) {
        const IngredientSelector = BlueprintSelect.Suggest.ofType<string>();

        return (
            <IngredientSelector
                fill={true}
                closeOnSelect={true}
                createNewItemFromQuery={props.canAdd ? createIngredient : undefined}
                createNewItemRenderer={props.canAdd ? renderCreateIngredient : undefined}
                inputValueRenderer={(ingredient: string) => ingredient}
                itemPredicate={filterIngredient}
                itemRenderer={renderIngredient}
                items={props.possibleIngredients}
                noResults={<Blueprint.MenuItem disabled={true} text={"No ingredients found."}/>}
                onItemSelect={onIngredientSelect}
            />
        );
    }

    const IngredientSelector = BlueprintSelect.MultiSelect.ofType<string>();

    return (
        <IngredientSelector
            placeholder={"Search for ingredients..."}
            tagRenderer={(item) => item}
            items={_.difference(props.possibleIngredients, props.selectedIngredients)}
            onItemSelect={onIngredientSelect}
            itemPredicate={filterIngredient}
            itemRenderer={renderIngredient}
            onRemove={removeIngredient}
            selectedItems={props.selectedIngredients}
            fill={true}
            noResults={<Blueprint.MenuItem disabled={true} text={"No ingredients found."}/>}
            createNewItemFromQuery={props.canAdd ? createIngredient : undefined}
            createNewItemRenderer={props.canAdd ? renderCreateIngredient : undefined}
            resetOnSelect={true}
        />
    );
}

IngredientSelect.displayName = COMPONENT_NAME;