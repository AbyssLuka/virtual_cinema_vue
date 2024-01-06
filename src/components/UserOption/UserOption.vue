<template>
    <div style="overflow: hidden;width: inherit;">
        <h2>用户名：{{state.userData.username}}</h2>
        <h2>更改邮箱：</h2>
        <div class="info-item">
            <label>
                <input class="luka-input" :placeholder="state.userData.email">
            </label><br/>
            <label>
                <input class="luka-input" placeholder="验证码">
            </label>
            <div class="luka-button button">获取验证码</div>
        </div>
        <h2>更改密码：</h2>
        <div class="info-item">
            <label>
                <input class="luka-input" v-model="state.updPwd.pwd" placeholder="英文+数字">
            </label><br/>
            <label>
                <input class="luka-input" v-model="state.updPwd.repeat" placeholder="重述">
            </label>
            <div class="luka-button button" @click="updatePassword">确定</div>
        </div>
        <h2>登出：</h2>
        <div class="info-item">
            <div class="luka-button button" @click="logout">确定</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import regular from "@/global/regular";
    import api from "@/request/api";

    import {reactive, onMounted} from "vue";
    import {useRouter} from "vue-router";

    import {I_ResData, I_UserInfo} from "@/global/interface";

    const state = reactive({
        updPwd: {
            pwd: "",
            repeat: ""
        },
        userData: {
            email: "",
            username: "",
            uuid: "",
            createTime: "",
        },
    });

    const router = useRouter();


    onMounted(async () => {
        let userInfo: I_ResData<I_UserInfo> = await api.userInfoApi() as unknown as I_ResData<I_UserInfo>;
        if (userInfo.data){
            state.userData = userInfo.data;
        }
    });

    async function updatePassword() {
        if (!regular.password.test(state.updPwd.pwd)) {
            alert("英文+数字8-16位");
            return;
        }
        if (state.updPwd.pwd !== state.updPwd.repeat) {
            alert("重复输入的密码不一致");
            return;
        }
        let username = state.userData.username;
        let password = state.updPwd.pwd;
        let reData: I_ResData<null> = await api.updatePasswordApi(username, password) as unknown as I_ResData<null>;
        if (reData.code === 200) {
            state.updPwd.pwd = "";
            state.updPwd.repeat = "";
            alert("成功")
        }
    }

    function logout() {
        localStorage.setItem("token", "");
        router.push("/login");
    }
</script>

<style scoped>
    .info-item {
        transform: translate(35px, 0);
        overflow: hidden;
        width: calc(100% - 35%);
    }

    .button {
        color: white;
        margin: 5px 0;
    }

    input {
        border-bottom: 2px solid white;
        color: white;
        width: 300px;
    }
    h2{
        color: white;
    }
</style>