<template>
    <div class="horiz-sb" style="width: 100%;height: 100%">
        <div class="tree-container">
            <directory-tree
                :dir="treeObject"
                :tree-click="treeClick">
            </directory-tree>
        </div>
        <div class="file-container-base">
            <div class="header-container horiz-sa center">
                <path-bar
                    class="file-path-header"
                    :path-list="state.pathList"
                    :pathClick="pathClick">
                </path-bar>
                <input class="search-file-input" type="text" v-model="keyword" @keyup.enter="searchFile"/>
            </div>
            <div class="file-container">
                <div class="file-item-container"
                     v-for="(files,filesIndex) in state.directoryAndFileList"
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
                <div v-show="state.directoryAndFileList[0].length === 0 && state.directoryAndFileList[1].length ===0"
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
import {fileTypeList} from "@/global/global";
import api from "@/request/api";
import {reactive, onMounted, ref} from "vue";
import {I_File, I_TreeNode} from "@/global/interface";
import DirectoryTree from "@/components/File/DirectoryTree.vue";

const loading = ref(false);
const keyword = ref("");

const treeObject = reactive<I_TreeNode>({
    title: "ROOT",
    subDirectory: [],
    show: true,
    type: "",
    uuid: "",
    absolutePath: ""
});

const state = reactive<{
    directoryAndFileList: I_File[][];
    pathList: string[],
}>({
    directoryAndFileList: [[], []],
    pathList: [],
});

const pathMap = new Map();
pathMap.set("", "");

onMounted(async () => {
    let resData = await api.subdirectoryApi("");
    resData.data && classification(resData.data);
    await treeClick(null, []);
});

async function searchFile(): Promise<void> {
    if (keyword.value.trim() !== "") {
        let resData = await api.searchFileApi(keyword.value);
        resData.data && classification(resData.data);
    } else {
        await pathClick("", 0);
    }
}

async function pathClick(_pathItem: string, index: number) {
    loading.value = !loading.value;
    const absPath = state.pathList.slice(0, index).join("\\");
    const resData = await api.subdirectoryApi(pathMap.get(absPath));
    if (resData.data) classification(resData.data);
    state.pathList = state.pathList.splice(0, index);
    loading.value = !loading.value;
}


async function treeClick(treeNode: I_TreeNode | null, pathList: number[]): Promise<void> {
    let sunDirUuid: string = !treeNode ? "" : treeNode.uuid;
    pathMap.set(treeNode?.absolutePath, sunDirUuid);
    let resData = await api.subdirectoryApi(sunDirUuid);
    let tempList: I_TreeNode[] = [];
    if (resData.data) for (let i = 0; i < resData.data.length; i++) {
        tempList.push({
            show: false,
            title: resData.data[i].fileName,
            uuid: resData.data[i].fileUuid,
            type: resData.data[i].fileType,
            absolutePath: <string>resData.data[i].absolutePath,
            subDirectory: []
        });
    }
    pathList.pop();
    const updateTree = (sub: I_TreeNode, list: I_TreeNode[], path: number[]) => {
        if (path.length === 0 && sub.subDirectory.length === 0) {
            sub.subDirectory = list;
            return;
        } else if (path.length === 0) return;
        const pop = path.pop();
        if (pop === void 0) return;
        updateTree(sub.subDirectory[pop], list, path);
    }
    updateTree(treeObject, tempList, pathList);
    treeNode && treeNode.title !== "ROOT" && nextFile({
        fileUuid: treeNode.uuid,
        fileType: treeNode.type,
        fileName: treeNode.title,
    }).then();
}

function classification(dataList: I_File[]): void {
    let directoryList: I_File[] = [], fileList: I_File[] = [];
    state.directoryAndFileList = [[], []];
    for (let dataItem of dataList) {
        dataItem.lastEditTime = util.convertData(dataItem.lastEditTime as string, "yyyy-MM-dd HH:mm:ss");
        let fileType = dataItem.fileType.toLowerCase();
        if (fileTypeList.directory.includes(fileType)) {
            dataItem.icon = "ri-folder-fill";
            dataItem.fileSize = "--";
            directoryList.push(dataItem)
        } else {
            dataItem.fileSize = util.convertByte(dataItem["fileSize"] as string);
            if (fileTypeList.package.includes(fileType)) {
                dataItem.icon = "ri-folder-zip-fill";
            } else if (fileTypeList.audio.includes(fileType)) {
                dataItem.icon = "ri-file-music-fill";
            } else if (fileTypeList.video.includes(fileType)) {
                dataItem.icon = "ri-movie-fill";
            } else if (fileTypeList.image.includes(fileType)) {
                dataItem.icon = "ri-image-fill";
            } else if (fileTypeList.document.includes(fileType)) {
                dataItem.icon = "ri-file-text-fill";
            } else if (fileTypeList.link.includes(fileType)) {
                dataItem.icon = "ri-link";
            } else {
                dataItem.icon = "ri-file-fill";
            }
            fileList.push(dataItem)
        }
    }
    state.directoryAndFileList[0] = directoryList;
    state.directoryAndFileList[1] = fileList;
}

async function nextFile(fileObject: I_File): Promise<void> {
    if (fileObject.absolutePath) {
        state.pathList = fileObject.absolutePath.split("\\");
    }
    // loading.value = !loading.value;
    // loading.value = !loading.value;
    let fileType = fileObject.fileType.toLowerCase();
    if (fileTypeList.directory.includes(fileType)) {
        let fileUuid = fileObject.fileUuid;
        pathMap.set(fileObject.absolutePath, fileUuid);
        let resData = await api.subdirectoryApi(fileUuid);
        resData.data && classification(resData.data);
    } else if (fileTypeList.video.includes(fileType)) {
        //使用弹窗打开视频
        createPopUps(VideoPlayer, {
            title: fileObject.fileName,
            data: fileObject,
            popUpsId: "video",
        }).then();
    } else if (fileTypeList.image.includes(fileType)) {
        let defaultIndex = 0, count = 0;
        const fileList = state.directoryAndFileList[1].filter((listItem: I_File) => {
            let states = fileTypeList.image.includes(listItem.fileType);
            if (listItem.fileUuid === fileObject.fileUuid) defaultIndex = count;
            if (states) count++;
            return states;
        });
        //使用弹窗打开图片
        createPopUps(ImagePopUps, {
            title: fileObject.fileName,
            data: {list: fileList, defaultIndex},
            popUpsId: "image",
        }).then()
    } else if (fileTypeList.document.includes(fileType)) {
        //使用弹窗打开文本
        createPopUps(DocumentView, {
            title: fileObject.fileName,
            data: fileObject,
            popUpsId: "document",
        }).then()
    }
}
</script>

<style scoped>

@media (max-width: 768px) {
    .tree-container {
        display: none;
    }

    .file-container-base {
        width: 100%;
        height: 100%
    }
}

@media (min-width: 768px) and (max-width: 1400px) {
    .tree-container {
        display: block;
    }

    .file-container-base {
        width: calc(100% - 320px);
        height: 100%
    }
}

@media (min-width: 1400px ) {
    .tree-container {
        display: block;
    }

    .file-container-base {
        width: calc(100% - 320px);
        height: 100%
    }
}

.file-path-header {
    width: 80%;
    height: 40px;
    border: 1px #aaaaaa solid;
}

.header-container {
    width: 100%;
    box-shadow: 5px 5px 10px rgba(50, 50, 50, 0.5);
    height: 50px;
    flex-direction: row;
}

.search-file-input {
    height: 40px;
    width: calc(20% - 30px);
    min-width: 100px;
    padding: 0 0 0 5px;
    outline: none;
    border-radius: 0;
    background: rgba(255, 255, 255, 0.5);
    border: 1px #aaaaaa solid;
}

.tree-container {
    width: 300px;
    height: 100%;
    overflow: auto;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
}

.tree-container::-webkit-scrollbar {
    display: none;
}

.file-container {
    width: 100%;
    height: calc(100% - 70px);
    box-shadow: 5px 5px 10px rgba(50, 50, 50, 0.5);
    backdrop-filter: blur(10px);
    margin: 20px 0;
    min-height: calc(100% - 90px);
    background: rgba(255, 255, 255, 0.50);
    overflow: auto;
}

.file-item-container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}

</style>