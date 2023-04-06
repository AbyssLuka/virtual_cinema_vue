export default {
    password: /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]{8,18}$/,
    username: /^[a-zA-Z0-9]{4,16}$/,
    email: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
    code: /[A-Za-z0-9]{4}/,
};