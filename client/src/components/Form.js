import React from 'react';

export default function Form(props) {
    return (
        <form action="">
            <input
                type="text"
                placeholder="Username..."
                value={props.username}
                onChange={props.onChange}
            />
            <button onClick={props.connect}>Connect</button>
        </form>
    )
}