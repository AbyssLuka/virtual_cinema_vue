<template>
    <div style="width: 100%;height: 100%">
        <div class="file-view-container">
            <dir-tree class="tree-container"
                      :dir="treeObject"
                      :tree-click="treeClick">
            </dir-tree>
            <div class="controller-container">
                <div @click="TODO()" class="ri-download-line ri-1x"></div>
                <div @click="TODO()" class="ri-delete-bin-2-line ri-1x"></div>
                <div @click="TODO()" class="ri-folder-add-line ri-1x"></div>
            </div>
            <path-bar
                class="file-path-header"
                :path-list="pathList"
                :path-click="pathClick">
            </path-bar>
            <div class="search-input-container">
                <input type="text"
                       class="search-file-input"
                       v-model="keyword"
                       @keyup.enter="searchFile"/>
                <div class="ri-search-line ri-2x search-icon" @click="searchFile()"></div>
            </div>
            <div class="file-container">
                <div class="file-item-container"
                     v-for="(files,filesIndex) in dirAndFile"
                     :key="filesIndex">
                    <div v-if="filesIndex === 0 && files.length > 0">文件夹：{{ files.length }}</div>
                    <div v-if="filesIndex === 1  && files.length > 0">文件：{{ files.length }}</div>
                    <div class="file-item-container">
                        <file-item v-for="file in files"
                                   :key="file.fileUuid"
                                   :data="file"
                                   :next-file="nextFile">
                        </file-item>
                    </div>
                </div>
                <div v-show="dirAndFile[0].length + dirAndFile[1].length ===0"
                     style="height: 100%;width: 100%" class="center">
                    <h2>没有文件</h2>
                </div>
            </div>
        </div>

        <div v-show="loading" class="mask-background">
            <div class="loading">加载中。。。</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import VideoPlayer from "@/components/File/PopUps/VideoPlayer.vue";
import ImagePopUps from "@/components/File/PopUps/ImagePopUps.vue";
import DocumentView from "@/components/File/PopUps/DocumentView.vue";
import PathBar from "@/components/File/PathBar.vue";
import FileItem from "@/components/File/FileItem.vue";
import util from "@/util/util";
import createPopUps from "@/util/createPopUps";
import {fileTypes, iconMap} from "@/global/global";
import api from "@/request/api";
import {reactive, onMounted, ref, onUnmounted} from "vue";
import {I_File, I_TreeNode} from "@/global/interface";
import DirTree from "@/components/File/DirTree.vue";

const loading = ref(false);
const keyword = ref("");

const treeObject = ref<I_TreeNode[]>([]);

const dirAndFile = ref<I_File[][]>([[], []],);
const pathList = ref<string[]>([]);

const pathMap = new Map();
pathMap.set("", "");

onMounted(() => {
    api.subdirectoryApi("").then((res) => {
        classification(res.data);
        res.data.forEach((item) => {
            treeObject.value.push({
                show: false,
                uuid: item.fileUuid,
                title: item.fileName,
                type: item.fileType,
                subDir: [],
                data: {
                    absPath: item.absolutePath!,
                },
            });
        });
    });
});

const searchFile = () => {
    if (keyword.value.trim() !== "") {
        api.searchFileApi(keyword.value).then((res) => {
            classification(res.data);
        });
    } else {
        pathClick(0);
    }
}

const pathClick = (index: number) => {
    loading.value = !loading.value;
    const absPath = pathList.value.slice(0, index).join("\\");
    api.subdirectoryApi(pathMap.get(absPath)).then(res => {
        classification(res.data);
        pathList.value = pathList.value.splice(0, index);
        loading.value = !loading.value;
    });
}

const treeClick = (treeNode: I_TreeNode, pathList: number[]) => {
    const sunDirUuid = !treeNode ? "" : treeNode.uuid;
    pathMap.set(treeNode.data.absPath, sunDirUuid);
    api.subdirectoryApi(sunDirUuid).then((res) => {
        const newList: I_TreeNode[] = [];
        res.data.forEach((item) => {
            newList.push({
                uuid: item.fileUuid,
                title: item.fileName,
                type: item.fileType,
                subDir: [],
                data: {
                    absPath: item.absolutePath!,
                },
            });
        });
        const updateTree = (sub: I_TreeNode[], newList: I_TreeNode[], path: number[]) => {
            if (path.length === 0 && sub.length === 0) {
                sub.push(...newList);
                return;
            } else if (path.length === 0) return;
            const pop = path.pop();
            if (pop === void 0) return;
            updateTree(sub[pop].subDir, newList, path);
        }
        updateTree(treeObject.value, newList, pathList);
        const {uuid:fileUuid, type: fileType, title: fileName} = treeNode;
        nextFile({fileUuid, fileType, fileName});
    });
}

const classification = (dataList: I_File[]) => {
    const directoryList: I_File[] = [];
    const fileList: I_File[] = [];
    dirAndFile.value = [[], []];
    for (const dataItem of dataList) {
        dataItem.lastEditTime = util.convertDate(dataItem.lastEditTime!, "yyyy-MM-dd HH:mm:ss");
        const type = fileTypes[dataItem.fileType.toLowerCase()];
        dataItem.icon = iconMap[type] || "ri-file-fill";
        if (type === "directory") {
            dataItem.fileSize = "--";
            directoryList.push(dataItem)
        } else {
            dataItem.fileSize = util.convertByte(dataItem.fileSize!);
            fileList.push(dataItem)
        }
    }
    dirAndFile.value[0] = directoryList;
    dirAndFile.value[1] = fileList;
}

const windowList: Function[] = []
const nextFile = (fileObject: I_File) => {
    if (fileObject.absolutePath) {
        pathList.value = fileObject.absolutePath.split("\\");
    }
    // loading.value = !loading.value;
    const fileType = fileObject.fileType.toLowerCase();
    if (fileTypes[fileType] === "directory") {
        const fileUuid = fileObject.fileUuid;
        pathMap.set(fileObject.absolutePath, fileUuid);
        api.subdirectoryApi(fileUuid).then((res) => {
            classification(res.data);
        });
    } else if (fileTypes[fileType] === "video") {
        //使用弹窗打开视频
        const fns = createPopUps(VideoPlayer, {
            title: fileObject.fileName,
            data: fileObject,
        })
        windowList.push(fns.cancelCallback);
    } else if (fileTypes[fileType] === "image") {
        let [defaultIndex, count] = [0, 0];
        const fileList = dirAndFile.value[1].filter((listItem: I_File) => {
            const states = fileTypes[listItem.fileType] === "image";
            if (listItem.fileUuid === fileObject.fileUuid) defaultIndex = count;
            if (states) count++;
            return states;
        });
        //使用弹窗打开图片
        const fns = createPopUps(ImagePopUps, {
            title: fileObject.fileName,
            data: {
                list: fileList,
                defaultIndex,
            },
        });
        windowList.push(fns.cancelCallback);
    } else if (fileTypes[fileType] === "document") {
        //使用弹窗打开文本
        const fns = createPopUps(DocumentView, {
            title: fileObject.fileName,
            data: fileObject,
        });
        windowList.push(fns.cancelCallback);
    }
}

const TODO = () => {
    alert("TODO");
}
onUnmounted(async () => {
    windowList.forEach((item: Function) => item())
})
</script>

<style scoped>

@media (max-width: 768px) {
    .tree-container {
        display: none;
    }

    .file-view-container {
        grid-template-columns: 1.2fr .8fr;
        grid-template-rows:
            .2fr
            .2fr
            1.8fr
            1fr;
        grid-template-areas:
            "controller controller"
            "file_path search"
            "file-content file-content"
            "file-content file-content";
    }
}

@media (min-width: 768px) and (max-width: 1400px) {
    .file-view-container {
        grid-template-columns: .8fr 1.6fr .6fr;
        grid-template-rows:
            .2fr
            .2fr
            1.8fr
            1fr;
        grid-template-areas:
            "tree controller controller"
            "tree file_path search"
            "tree file-content file-content"
            "tree file-content file-content";
    }
}

@media (min-width: 1400px ) {
    .file-view-container {
        grid-template-columns: .8fr 1.6fr .6fr;
        grid-template-rows:
            .2fr
            .2fr
            1.8fr
            1fr;
        grid-template-areas:
            "tree controller controller"
            "tree file_path search"
            "tree file-content file-content"
            "tree file-content file-content";
    }
}

.controller-container {
    grid-area: controller;
    background: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
}

.controller-container > div:hover {
    color: orangered;
}

.controller-container > div {
    margin: 10px;
}

.file-view-container {
    display: grid;
    gap: 5px 5px;
    grid-auto-flow: row;
    width: 100%;
    height: 100%;
}

.tree-container {
    grid-area: tree;
    overflow: auto;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
}

.file-container {
    grid-area: file-content;
    box-shadow: 5px 5px 10px rgba(50, 50, 50, 0.5);
    backdrop-filter: blur(10px);
    min-height: calc(100% - 90px);
    background: rgba(255, 255, 255, 0.50);
    overflow: auto;
}

.search-input-container {
    grid-area: search;
    position: relative;
}
.search-file-input{
    padding: 0 0 0 5px;
    outline: none;
    border-radius: 0;
    background: rgba(255, 255, 255, 0.5);
    border: 1px #aaaaaa solid;
    width: 100%;
    height: 100%;
}

.file-path-header {
    grid-area: file_path;
    border: 1px #aaaaaa solid;
}

.tree-container::-webkit-scrollbar {
    display: none;
}

.file-item-container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}

.search-icon{
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translate(0, -50%);
}

.search-icon:hover {
    color: orangered;
}

</style>