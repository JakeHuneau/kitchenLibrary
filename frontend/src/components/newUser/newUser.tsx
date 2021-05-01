import * as React from "react";
import {useState} from "react";
import * as Blueprint from "@blueprintjs/core";
import "./newUser.scss"
import {handleStringChange} from "@blueprintjs/docs-theme";
import {Api} from "../../api/Api";
import {Toaster} from "../../KitchenLibrary";

interface Props {

}

const COMPONENT_NAME = "NewUser"

export const NewUser: React.FunctionComponent<Props> = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [disableSaveButton, setDisableSaveButton] = useState(false);

    return (
        <div className={COMPONENT_NAME}>
            <div className={`${COMPONENT_NAME}__field`}>
                Username: <Blueprint.InputGroup
                value={username.toLowerCase()}
                onChange={handleStringChange(((newUsername) => setUsername(newUsername)))}
            />
            </div>
            <br/>
            <br/>
            <div className={`${COMPONENT_NAME}__field`}>
                Password: <Blueprint.InputGroup
                className={`${COMPONENT_NAME}__password`}
                value={password}
                onChange={handleStringChange(((newPassword) => setPassword(newPassword)))}
                type={"password"}
            />
            </div>
            <br/>
            <br/>
            <Blueprint.Button
                disabled={disableSaveButton}
                onClick={() => {
                    setDisableSaveButton(true);
                    Api.User.addUser(username, password).then((result) => {
                        setDisableSaveButton(false);
                        if (result.success) {
                            Toaster.show({
                                intent: Blueprint.Intent.SUCCESS,
                                message: `Welcome to the club, ${username}!`,
                                timeout: 2000
                            });
                        } else {
                            Toaster.show({
                                intent: Blueprint.Intent.SUCCESS,
                                message: `Failed to add ${username}`,
                                timeout: 2000
                            });
                            console.log(result.message);
                        }
                    })}}>
                Add User
            </Blueprint.Button>
        </div>
    )
}

NewUser.displayName = COMPONENT_NAME;