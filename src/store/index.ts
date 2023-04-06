import {createStore} from "vuex";

const store = createStore({
    state: {
        userData: {
            token: "",
        },
    },
    getters: {
        getToken(state) {
            return state.userData.token;
        }
    },
    mutations: {
        setToken(state, token) {
            state.userData.token = token;
        }
    },
    actions: {},
    modules: {},

});

export default store;