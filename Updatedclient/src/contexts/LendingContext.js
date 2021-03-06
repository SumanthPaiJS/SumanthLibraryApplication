import React, { createContext, useReducer, useEffect } from 'react';
import { lendingReducer } from '../reducers/LendingReducer';
//import config from '../config/config';
//import axios from 'axios';

export const lendingContext = createContext();

const LendingContextProvider = (props) => {
    const initState = {
        isLoading: false,
        list: []
    }

    const [ lending, dispatch ] = useReducer(lendingReducer, initState);

/*
    useEffect(() => {
        axios.get(config.base_url + '/lendings')
            .then((result) => {
                dispatch({ type: 'GET_LENDING_LIST', payload: result.data})
            })
    }, [])
*/

    return(
        <lendingContext.Provider value={{lending, dispatch}}>
            {props.children}
        </lendingContext.Provider>
    )
}

export default LendingContextProvider;