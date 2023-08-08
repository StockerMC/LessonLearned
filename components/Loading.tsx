import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

// TODO: DOESNT WORK
export default function Loading(props: {active: boolean}) {
    const [style, setStyle] = useState(
        {position: 'absolute', top: '0', display: props.active ? 'flex': 'none', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100vh'}
    );

    useEffect(() => {
        setStyle({position: 'absolute', top: '0', display: props.active ? 'flex': 'none', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100vh'})
    }, [props.active])

    return (
        // @ts-ignore
        <div style={style}>
            <FontAwesomeIcon icon={faSpinner} spin size='8x' />
        </div>
    )
}