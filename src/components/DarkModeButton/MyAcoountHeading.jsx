import React from 'react';
import Styles from "./MyAcoountHeading.module.css"

export default function MyAcoountHeading({name}) {
    return (
        <div>
            <button className={Styles.btn}>
                {name}
            </button>
        </div>
    )
}
