<template>
    <div id="app">
        <router-view/>
<!--        <cursor-osu></cursor-osu>-->
    </div>
</template>


<script setup lang="ts">
    import {onBeforeMount} from "vue";
    // import CursorOsu from "@/components/module/Cursor.vue";

    onBeforeMount(() => {
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
        background: url("../public/background.jpg") no-repeat center center fixed;
        background-size: cover;
    }

</style>
