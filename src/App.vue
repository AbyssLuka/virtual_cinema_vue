<template>
    <div id="app"
         :style="`background: url('${imagePath}') no-repeat center center fixed;background-size: cover`"
         class="main-container"
    >
        <router-view/>
        <loading/>
    </div>
    <cursor-osu></cursor-osu>
</template>


<script setup lang="ts">
import {onBeforeMount, onMounted, ref, useTemplateRef} from "vue";
import CursorOsu from "@/components/module/CursorOsu.vue";
import wallpaperPath from "@/assets/image/wallhaven-8586my.png"
import Loading from "@/components/module/Loading.vue";

const imagePath = ref("");

const loadBackground = () => {
    const path = localStorage.getItem("/:backgroundImageUrl");
    if (["", "null", void 0, null, "undefined"].includes(path)) {
        imagePath.value = wallpaperPath;
    } else {
        imagePath.value = <string>path;
    }
}

window.setBackgroundImage = (url: string) => {
    try {
        //验证url是否合法
        new URL(url);
    } catch (e) {
        url = wallpaperPath;
    } finally {
        imagePath.value = url;
        localStorage.setItem("/:backgroundImageUrl", url);
    }
}

onBeforeMount(() => {
    loadBackground();
    console.log(
        "%c" +
        "   _               _             \n" +
        "  | |     _  _    | |__   __ _   \n" +
        "  | |__  | +| |   | / /  / _` |  \n" +
        "  |____|  \\_,_|   |_\\_\\  \\__,_|  \n" +
        "_|\"\"\"\"\"|_|\"\"\"\"\"|_|\"\"\"\"\"|_|\"\"\"\"\"| \n" +
        "\"`-0-0-'\"`-0-0-'\"`-0-0-'\"`-0-0-' "
        , "color:orangered;background:while");
    console.log(
        "                          &&&&&&&&                         \n" +
        "              ^           @@@@@@@@           ^             \n" +
        "            &@@ +         @@@@@@@@         +%@@            \n" +
        "          @   @# #^                      @.@@+%@@          \n" +
        "        #@@ @#-@@n     __=/*^^^*=__      -@@ #@.8@@        \n" +
        "          @@ @@o     .#^         '~@@+      $@.@@          \n" +
        "            #o     u                @@@@     ^@-           \n" +
        "                 ;          @@@%     @@@@@                 \n" +
        "                $          @@@@@     @@@@@@                \n" +
        "         .     ;             v       @@@@@@@               \n" +
        "     @!@@ @   .                    .@@@@@@@@!   @@*@ @#    \n" +
        "     @!@@ @   :                  %@@@@@@@@@@$   @@*@ @#    \n" +
        "     @!on @   ;           @@@@@@@@@@@@@@@@@@&   oo^@ on    \n" +
        "     @!@@ @   '        .@@@@@@@@@@@@@@@@@@@@.   @@*@ @#    \n" +
        "               ^       @@@@@@ u#@@@@@@@@@@@@               \n" +
        "                1.    @@@@@     @@@@@@@@@@#                \n" +
        "                 ;    ~@@@@@   1@@@@@@@@@#                 \n" +
        "             @     ^   @@@@@@@@@@@@@@@@@'      1           \n" +
        "           @@ @@      8. @@@@@@@@@@@@o      @@@.u.         \n" +
        "         @@~1@ .@@       '**++++*''       @^ +## #u        \n" +
        "          .@  1@@ #                     6@%-@;.@@.         \n" +
        "             @@~u-       @@@  @@@         1@.@@            \n" +
        "               =         @@@  @@@           u.             \n" +
        "                         ###  $$$                          \n")
});
</script>

<style>
* {
    margin: 0;
    padding: 0;
    list-style: none;
}

a {
    text-decoration: none;
}

.router-link-active {
    text-decoration: none;
}

#app {
    width: 100vw;
    height: 100vh;
    /*
    background: url("assets/image/wallhaven-8586my.png") no-repeat center center fixed;
    */
    background-size: cover;
}

</style>
