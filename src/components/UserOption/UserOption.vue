<template>
    <div style="overflow: hidden;width: inherit;">
        <h2>用户名：{{ userData.username }}</h2>
        <h2>更改邮箱：</h2>
        <div class="info-item">
            <label>
                <input class="luka-input" :placeholder="userData.email">
            </label><br/>
            <label>
                <input class="luka-input" placeholder="验证码">
            </label>
            <div class="luka-button button">获取验证码</div>
        </div>
        <h2>更改密码：</h2>
        <div class="info-item">
            <label>
                <input class="luka-input" v-model="updatePasswordState.old" placeholder="旧密码">
            </label><br/>
            <label>
                <input class="luka-input" v-model="updatePasswordState.new" placeholder="新密码">
            </label><br/>
            <label>
                <input class="luka-input" v-model="updatePasswordState.repeat" placeholder="再一次输入">
            </label>
            <div class="luka-button button" @click="updatePassword">确定</div>
        </div>
        <h2>修改壁纸：</h2>
        <div class="info-item">
            <label>
                <input class="luka-input" v-model="imageUrl" placeholder="输入图片url">
            </label><br/>
            <div class="luka-button button" @click="setBackgroundImage">确定</div>
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

import {reactive, onMounted, ref} from "vue";
import {useRouter} from "vue-router";

const updatePasswordState = reactive({
    old: "",
    new: "",
    repeat: ""
});

const userData = reactive({
    email: "",
    username: "",
    uuid: "",
    createTime: "",
})

const router = useRouter();

const imageUrl = ref("");
const setBackgroundImage = () => {
    window.setBackgroundImage && window.setBackgroundImage(imageUrl.value);
}

onMounted(async () => {
    let userInfo = await api.userInfoApi();
    console.log(userInfo.data)
    if (userInfo.data) {
        userData.createTime = userInfo.data?.createTime;
        userData.email = userInfo.data?.email;
        userData.uuid = userInfo.data?.uuid;
        userData.username = userInfo.data?.username;
    }
});

async function updatePassword() {
    if (!regular.password.test(updatePasswordState.new)) {
        alert("英文+数字8-16位");
        return;
    }
    if (updatePasswordState.new !== updatePasswordState.repeat) {
        alert("重复输入的密码不一致");
        return;
    }
    const newPassword = updatePasswordState.new;
    const oldPassword = updatePasswordState.old;
    const reData = await api.updatePasswordApi({newPassword, oldPassword});
    if (reData.code === 200) {
        updatePasswordState.old = "";
        updatePasswordState.new = "";
        updatePasswordState.repeat = "";
        alert("成功")
    }else {
        alert("失败")
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

input::placeholder {
    color: black;
    text-shadow: 0 0 4px #b4b4b4;
}

h2 {
    color: white;
}
</style>