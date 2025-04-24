<template>
    <div class="login-background">
        <div class="login-window">
            <div class="page-1" style="--i:2;"></div>
            <!--            封面-->
            <div class="page-2" style="--i:4;--s:1;">
            </div>
            <div class="page-3" style="--i:3;--s:2;"></div>
            <div class="page-4" style="--i:2;--s:3;">
                <h2 class="login-title">LOGIN</h2>
                <form class="login-input" @submit.prevent="login">
                    <div class="input-label">
                        <input v-model="loginData.username" id="login-user-name" type="text" required="true"/>
                        <span class="input-text" id="login-input-text-username">USERNAME</span>
                    </div>
                    <div class="input-label">
                        <input v-model="loginData.password" id="login-pass-word" type="password"
                               required="true"/>
                        <span class="input-text" id="login-input-text-password">PASSWORD</span>
                    </div>
                    <div class="code-container">
                        <div class="input-label">
                            <input v-model="loginData.code" id="login-code" type="text" required="true"
                                   autocomplete="off"/>
                            <span class="input-text" id="login-input-text-code">CODE</span>
                        </div>
                        <img class="img-div" :src="kaptcha" @click="uploadCode" alt=""/>
                    </div>

                    <div class="login-btn-container">
                        <button type="submit" class="login-btn" @click="login">LOGIN</button>
                    </div>
                </form>
            </div>

            <div class="page-5" style="--i:1;--s:4;">
                <div class="page-5-revers">
                    <h2 class="login-title">SIGNUP</h2>
                    <form class="login-input" @submit.prevent="signup">
                        <label class="input-label">
                            <input v-model="registerData.username" id="register-user-name" type="text"
                                   required="true"/>
                            <span class="input-text" id="register-input-text-username">USERNAME</span>
                        </label>
                        <label class="input-label">
                            <input v-model="registerData.password" id="register-pass-word" type="password"
                                   required="true"/>
                            <span class="input-text" id="register-input-text-password">PASSWORD</span>
                        </label>
                        <label class="input-label">
                            <input v-model="registerData.email" id="register-emali" type="text"
                                   required="true"
                                   autocomplete="off"/>
                            <span class="input-text" id="register-input-text-emali">EMAIL</span>
                        </label>
                        <div class="login-btn-container">
                            <button type="submit" class="login-btn" @click="signup">SIGNUP</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="tips-content" v-show="tips.show">{{ tips.info }}</div>
</template>

<script setup lang="ts">
import api from "@/request/api";
import regular from "@/global/regular";
import {reactive, onMounted, ref} from "vue";
import {useRouter, useRoute} from "vue-router";

const router = useRouter();
const route = useRoute();
const kaptcha = ref("");

const loginData = reactive({
    username: "",
    password: "",
    code: "",
});
const registerData = reactive({
    username: "",
    password: "",
    email: "",
});
const tips = reactive({
    show: false,
    info: "",
});

onMounted(() => {
    uploadCode();
});

const uploadCode = () => {
    kaptcha.value = api.kaptchaUrl();
}

const login = () => {
    let flag: boolean = regular.username.test(loginData.username);
    flag || showTips("用户名必须4~16位英文+数字！", 3000);
    if (!flag) return;
    flag = regular.password.test(loginData.password);
    flag || showTips("密码必须8~16位英文+数字！", 3000);
    if (!flag) return;
    flag = regular.code.test(loginData.code);
    flag || showTips("验证码输入错误！", 3000);
    if (!flag) return;

    api.loginApi(loginData).then((res) => {
        if (res.code === 200) {
            route.query.redirect || router.push("/");
            route.query.redirect && router.push(route.query.redirect.toString());
        } else {
            showTips(res.msg, 3000)
        }
    });
}

const signup = () => {
    let flag: boolean = regular.username.test(registerData.username);
    flag || showTips("用户名必须4~16位英文+数字！", 3000);
    if (!flag) return;
    flag = regular.password.test(registerData.password);
    flag || showTips("密码必须8~16位英文+数字！", 3000);
    if (!flag) return;
    flag = regular.email.test(registerData.email);
    flag || showTips("邮箱格式错误！", 3000);
    if (!flag) return;
    api.registerApi(registerData).then((res) => {
        showTips(res.msg, 5000);
    });
}

const showTips = (info: string, time: number) => {
    tips.info = info;
    tips.show = true;
    setTimeout(() => {
        tips.show = false;
    }, time)
}
</script>

<style scoped>

@media (max-width: 768px) {
    .page-1, .page-2, .page-3, .page-5 {
        display: none;
    }

    .page-4 {
        transform: translate(-200px);
    }
}

@media (min-width: 768px) {
}

.tips-content {
    position: fixed;
    top: 10px;
    left: 50%;
    width: 200px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    color: orangered;
    font-weight: bold;
    transform: translate(-50%, 0);
    animation: .5s tips-in-animation forwards;
    overflow: hidden;
}

@keyframes tips-in-animation {
    from {
        height: 0;
    }
    to {
        height: 50px;
    }
}

.page-5-revers {
    transform: rotateY(-180deg);
    width: 100%;
    height: 100%;
}

.login-background {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.login-window {
    width: 400px;
    height: 600px;
    transform: translateX(200px);
    user-select: none;
    transform-style: preserve-3d;
    perspective: 1000px;
    transition: .8s;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.page-1, .page-2, .page-3, .page-4, .page-5 {
    width: 400px;
    height: 600px;
    transform-origin: left;
    background-size: cover;
    transition: calc(var(--i) * .3s);
    z-index: calc(var(--i) * 99);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    position: fixed;
}


.page-1, .page-2 {
    border: solid 20px rgba(255, 255, 255, 0.1);
    border-left: solid 1px rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);

}

.page-2, .page-3, .page-5 {
    z-index: calc(var(--s) * 99);
    animation: calc(var(--s) * .4s) turnPages forwards;
}

@keyframes turnPages {
    from {
        transform: rotateY(0deg);
    }
    to {
        transform: rotateY(-180deg);
    }
}

.login-title {
    height: 20%;
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
}

.login-input {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    height: 75%;
}

.input-label {
    display: flex;
    flex-direction: column;
    position: relative;
}

.input-text {
    position: absolute;
    top: 10px;
    transition: .5s;
}

input {
    background: transparent;
    border: 0 solid black;
    border-bottom: 2px solid black;
    outline: none;
    height: 35px;
}

#login-pass-word, #login-user-name {
    width: 300px;
}

#login-code {
    width: 150px;
}

#login-user-name:focus ~ #login-input-text-username,
#login-user-name:valid ~ #login-input-text-username {
    top: -20px;
    color: orangered;
}

#login-pass-word:focus ~ #login-input-text-password,
#login-pass-word:valid ~ #login-input-text-password {
    top: -20px;
    color: orangered;
}

#login-code:focus + #login-input-text-code,
#login-code:valid + #login-input-text-code {
    top: -20px;
    color: orangered;
}


#register-pass-word, #register-user-name, #register-emali {
    width: 300px;
}

#login-code {
    width: 150px;
}

#register-user-name:focus ~ #register-input-text-username,
#register-user-name:valid ~ #register-input-text-username {
    top: -20px;
    color: orangered;
}

#register-pass-word:focus ~ #register-input-text-password,
#register-pass-word:valid ~ #register-input-text-password {
    top: -20px;
    color: orangered;
}

#register-emali:focus + #register-input-text-emali,
#register-emali:valid + #register-input-text-emali {
    top: -20px;
    color: orangered;
}


.code-container {
    display: flex;
    justify-content: space-between;
    width: 300px;
}

.img-div {
    width: 100px;
    height: 37px;
}

.login-btn-container {
    display: flex;
    justify-content: space-around;
    width: 300px;
    height: 10%;
}

.login-btn {
    width: 80px;
    height: 40px;
    background: transparent;
    border: 2px solid black;
    border-radius: 2px;
    display: flex;
    font-weight: bold;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.login-btn:hover {
    border: 2px solid orangered;
}

.login-btn:active {
    box-shadow: 0 0 #ff8379;
    color: #7ce0ff;
    margin: 2px 0 0 0;
}
</style>