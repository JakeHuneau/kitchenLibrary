import axios from "axios"
/**
 * API response.
 * T is the type of data that is given
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T
}

/**
 * Information about an ingredient that is in a recipe
 */
export interface IngredientInfo {
    name: string;
    quantity: number;
    unit: string;
    required: boolean;
}

/**
 * Information about a recipe
 */
export interface RecipeInfo {
    name: string;
    directions: string;
}

/**
 * Information about a new recipe to be added to database
 */
export interface NewRecipe {
    name: string;
    ingredients: IngredientInfo[];
    directions: string;
}

/**
 * All information about a recipe
 */
export interface FullRecipe {
    recipe_info: RecipeInfo;
    ingredients: IngredientInfo[]
}

export namespace Api {
    const endpoint = "https://3ngv4gtvia.execute-api.us-east-2.amazonaws.com/prod";

    export namespace Ingredient {
        /**
         * Gets all the ingredient names
         */
        export function getAllIngredients(): Promise<ApiResponse<string[]>> {
            return axios.get<ApiResponse<string[]>>(`${endpoint}/ingredients`)
                .then((result) => result.data);
        }
    }

    export namespace Kitchen {
        /**
         * Gets contents of a user's kitchen
         * @param user_id - encrypted user id we're look up
         * @returns Promise<ApiResponse> with string[] as data showing what ingredients user has
         */
        export function getKitchenContents(user_id: string): Promise<ApiResponse<string[]>> {
            return axios.get<ApiResponse<string[]>>(`${endpoint}/kitchen/${user_id}`)
                .then((result) => result.data);
        }

        /**
         * Updates the contents of a user's kitchen
         * @param user_id - encrypted user id we're updating
         * @param ingredients - ingredients in user's kitchen
         * @returns Promise<ApiResponse>
         */
        export function updateKitchen(user_id: string, ingredients: string[]): Promise<ApiResponse<null>> {
            return axios.put<ApiResponse<null>>(`${endpoint}/kitchen/${user_id}`, ingredients)
                .then((result) => result.data);
        }
    }

    export namespace User {
        /**
         * Adds a new user to the database
         * @param username - new user name
         * @param password - user password
         * @param can_write - If user can make new recipes
         * @param can_delete - If user can delete recipes
         * @param can_alter_users - If user can change other users' permissions
         */
        export function addUser(username: string,
                                password: string,
                                can_write: boolean = false,
                                can_delete: boolean = false,
                                can_alter_users: boolean = false): Promise<ApiResponse<null>> {
            return axios.put<ApiResponse<null>>(`${endpoint}/users/${username}`, null, {
                params: {
                    password: password,
                    can_write: can_write,
                    can_delete: can_delete,
                    can_alter_users: can_alter_users
                }
            })
                .then((result) => result.data)
        }

        /**
         * updates a user's permissions
         * @param username - user being updated
         * @param reference_user_id - encrypted user id that is trying to update other user
         * @param can_write - If user can make new recipes
         * @param can_delete - If user can delete recipes
         * @param can_alter_users - If user can change other users' permissions
         */
        export function updatePermissions(username: string,
                                          reference_user_id: string,
                                          can_write: boolean = false,
                                          can_delete: boolean = false,
                                          can_alter_users: boolean = false): Promise<ApiResponse<null>> {
            return axios.put<ApiResponse<null>>(`${endpoint}/users/updatePermissions/${username}`, null, {
                params: {
                    reference_id: reference_user_id,
                    can_write: can_write,
                    can_delete: can_delete,
                    can_alter_users: can_alter_users
                }
            }).then((result) => result.data)
        }

        /**
         * Updates a user's password
         * @param username - new user name
         * @param password - user password
         */
        export function updatePassword(username: string,
                                password: string): Promise<ApiResponse<null>> {
            return axios.put<ApiResponse<null>>(`${endpoint}/users/updatePassword/${username}`, null, {
                params: {
                    password: password,
                }
            })
                .then((result) => result.data)
        }

        /**
         * Deletes a new user from the database
         * @param username - new user name
         */
        export function deleteUser(username: string): Promise<ApiResponse<null>> {
            return axios.delete<ApiResponse<null>>(`${endpoint}/users/${username}`)
                .then((result) => result.data)
        }

        /**
         * Attempts to sign a user in
         * @param username - username of user
         * @param password - user password
         * @returns ApiResponse<string> with data being encrypted user id
         */
        export function signIn(username: string, password: string): Promise<ApiResponse<string>> {
            return axios.post<ApiResponse<string>>(`${endpoint}/users/signIn/${username}`, null, {
                params: {
                    password: password
                }
            }).then((result) => result.data)
        }
    }

    export namespace Recipe {

        /**
         * Adds a new recipe to Database
         * @param recipe - NewRecipe description of recipe being added
         * @param reference_id - encrypted id of user trying to add recipe
         */
        export function addRecipe(recipe: NewRecipe, reference_id: string): Promise<ApiResponse<null>> {
            return axios.put<ApiResponse<null>>(`${endpoint}/recipes`, {
                directions: recipe.directions,
                ingredients: recipe.ingredients,
                name: recipe.name
            }, {
                params: {
                    reference_id: reference_id
                }
            }).then((result) => result.data)
        }

        /**
         *
         * @param recipe_name - name of recipe to be deleted
         * @param reference_id - encrypted id of user trying to delete recipe
         */
        export function deleteRecipe(recipe_name: string, reference_id: string): Promise<ApiResponse<null>> {
            return axios.delete<ApiResponse<null>>(`${endpoint}/recipes/${recipe_name}`,{
                params: {
                    reference_id: reference_id
                }
            }).then((result) => result.data)
        }

        /**
         * Gets information about a single recipe
         * @param recipe_name - name of recipe
         */
        export function getRecipe(recipe_name: string): Promise<ApiResponse<FullRecipe>> {
            return axios.post<ApiResponse<FullRecipe>>(`${endpoint}/recipes/search/${recipe_name}`)
                .then((result) => result.data)
        }

        /**
         * Gets all the recipes that contain any of the inputted ingredients
         * @param ingredients - list of ingredient names
         */
        export function getAllRecipes(ingredients: string[]): Promise<ApiResponse<FullRecipe[]>> {
            return axios.post<ApiResponse<FullRecipe[]>>(`${endpoint}/recipes/match_any`, ingredients)
                .then((result) => result.data)
        }

        /**
         * Gets all recipes that contain all the inputted ingredients
         * @param ingredients - list of ingredient names
         */
        export function getMatchingRecipes(ingredients: string[]): Promise<ApiResponse<FullRecipe[]>> {
            return axios.post<ApiResponse<FullRecipe[]>>(`${endpoint}/recipes/match_all`, ingredients)
                .then((result) => result.data)
        }
    }
}