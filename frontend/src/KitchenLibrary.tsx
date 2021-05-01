import React from 'react';
import './KitchenLibrary.scss';
import {Api, ApiResponse} from './api/Api';
import {Login} from "./components/login/login";
import * as Blueprint from "@blueprintjs/core";
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Home} from "./components/home/home";
import {NewRecipe} from "./components/newRecipe/newRecipe";
import {NewUser} from "./components/newUser/newUser";
import {User} from "./components/user/user";
import  Cookies  from "js-cookie";

interface State {
    userId: string | undefined;
    userIngredients: string[];
    possibleIngredients: string[];
}

interface Props {

}

const COMPONENT_NAME = "KitchenLibrary"

/**
 * Toaster to be used in app
 */
export const Toaster = Blueprint.Toaster.create({
    position: Blueprint.Position.TOP
})

/**
 * Kitchen Library
 */
export default class KitchenLibrary extends React.Component<Props, State> {
    /**
     * @inheritDoc
     */
    public constructor(props: Props) {
        super(props);
        this.state = {
            userId: Cookies.get("userId"),
            userIngredients: [],
            possibleIngredients: []
        }
    }

    /**
     * @inheritDoc
     */
    public componentDidMount() {
        Api.Ingredient.getAllIngredients()
            .then((result: ApiResponse<string[]>) => this.setState({possibleIngredients: result.data})
            )
    }

    /**
     * @inheritDoc
     */
    public render(): JSX.Element {
        const header = (
            <div className={`${COMPONENT_NAME}__header`}>
                <div className={`${COMPONENT_NAME}__header__left`}>
                    <Link to={"/"}>Kitchen Library</Link>
                </div>

                <div className={`${COMPONENT_NAME}__header__right`}>
                    <Login
                        userId={this.state.userId}
                        setUserId={(newUserId) => {
                            this.setState({userId: newUserId});
                            if (newUserId) {
                                Cookies.set("userId", newUserId);
                            } else {
                                Cookies.remove("userId")
                            }
                        }}
                    />
                </div>
            </div>);

        return (
            <div className={COMPONENT_NAME}>
                <Router>
                    {header}
                    <br/>
                    <br/>
                    <Switch>
                        <Route path={"/newRecipe"}>
                            <NewRecipe
                                userId={this.state.userId}
                                possibleIngredients={this.state.possibleIngredients}
                            />
                        </Route>
                        <Route path={"/newUser"}>
                            <NewUser/>
                        </Route>
                        <Route path={"/userPage"}>
                            <User/>
                        </Route>
                        <Route path={"/"}>
                            <Home
                                possibleIngredients={this.state.possibleIngredients}
                            />
                        </Route>
                    </Switch>
                </Router>
            </div>
        );
    }
}
