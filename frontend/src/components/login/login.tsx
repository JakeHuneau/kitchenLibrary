import * as React from "react";
import {useState} from "react";
import * as Blueprint from "@blueprintjs/core"
import {handleStringChange} from "@blueprintjs/docs-theme";
import {Api} from "../../api/Api";
import {Toaster} from "../../KitchenLibrary";
import "./login.scss"
import {useHistory} from "react-router-dom";

interface Props {
    userId: string | undefined;
    setUserId: (userId: string | undefined) => void;
}

const COMPONENT_NAME = "Login"

export const Login: React.FunctionComponent<Props> = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [disableLoginButton, setDisableLoginButton] = useState(false);
    const history = useHistory();

    return (
        <div className={COMPONENT_NAME}>
            {
                props.userId === undefined ?
                    <div className={`${COMPONENT_NAME}__fields`}>
                        <Blueprint.InputGroup
                            value={username}
                            onChange={handleStringChange((newUsername) => setUsername(newUsername))}
                            placeholder={"Username"}
                        />
                        <Blueprint.InputGroup
                            value={password}
                            onChange={handleStringChange((newPassword) => setPassword(newPassword))}
                            placeholder={"Password"}
                            type={"password"}
                        />
                        <Blueprint.Button
                            disabled={disableLoginButton}
                            onClick={() => {
                                setDisableLoginButton(true);
                                Api.User.signIn(username.toLowerCase(), password).then((result) => {
                                    setDisableLoginButton(false);
                                    if (result.success) {
                                        props.setUserId(result.data);
                                    } else {
                                        Toaster.show({
                                            intent: Blueprint.Intent.DANGER,
                                            message: "Login Failed",
                                            timeout: 2000
                                        })
                                    }
                                })
                            }}>
                            Log in
                        </Blueprint.Button>
                        <Blueprint.Button onClick={() => history.push("/newUser")}>
                            Create account
                        </Blueprint.Button>

                    </div>
                    :
                    <div className={`${COMPONENT_NAME}__logged-in`}>
                        You are logged in
                        <Blueprint.Button onClick={() => history.push("/userPage")}>
                            User Page
                        </Blueprint.Button>
                        <Blueprint.Button onClick={() => history.push("/newRecipe")}>
                            Add Recipe
                        </Blueprint.Button>
                        <Blueprint.Button onClick={() => {
                            props.setUserId(undefined);
                            setUsername("");  // Reset username
                            setPassword("");  // Reset password
                            history.push("/");  // Go back to home page
                        }}>
                            Log out
                        </Blueprint.Button>
                    </div>
            }
        </div>
    );
};

Login.displayName = COMPONENT_NAME;