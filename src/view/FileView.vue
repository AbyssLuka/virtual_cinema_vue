<template>
    <div class="horiz-sb" style="width: 100%;height: 100%">
        <div class="tree-container">
            <directory-tree :dir="state.treeObject" :tree-click="treeClick" :path-index="0"></directory-tree>
        </div>
        <div class="file-container-base">
            <div class="header-container horiz-sa center">
                <file-path-header class="file-path-header" :path-list="state.pathList" :pathClick="pathClick">
                </file-path-header>
                <input class="search-file-input" type="text" v-model="state.keyword" @keyup.enter="searchFile"/>
            </div>
            <div class="file-container">
                <div class="file-item-container"
                     v-for="(files,filesIndex) in state.directoryAndFileList"
                     :key="filesIndex">
                    <div v-if="filesIndex === 0 && files.length > 0">文件夹：{{files.length}}</div>
                    <div v-if="filesIndex === 1  && files.length > 0">文件：{{files.length}}</div>
                    <div class="file-item-container">
                        <file-item v-for="(file,index) in files" :key="index" :data="file" :next-file="nextFile">
                        </file-item>
                    </div>
                </div>
                <div v-show="state.directoryAndFileList[0].length === 0 && state.directoryAndFileList[1].length ===0"
                     style="height: 100%;width: 100%" class="center">
                    <h2>没有文件</h2>
                </div>
            </div>
        </div>
        <div v-show="state.loading" class="mask-background">
            <div class="loading">加载中。。。</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import VideoPlayer from "@/components/File/PopUps/VideoPlayer.vue";
    import ImagePopUps from "@/components/File/PopUps/ImagePopUps.vue";
    import DocumentView from "@/components/File/PopUps/DocumentView.vue";
    import FilePathHeader from "@/components/File/FilePathHeader.vue";
    import FileItem from "@/components/File/FileItem.vue";
    import DirectoryTree from "@/components/File/DirectoryTree.vue";
    import util from "@/util/util";
    import createPopUps from "@/util/createPopUps";
    import {fileTypeList} from "@/global/global";
    import api from "@/request/api";
    import {reactive, onMounted} from "vue";
    import {I_File, I_ResData,I_TreeNode} from "@/global/interface";

    const state = reactive<{
        directoryAndFileList: I_File[][];
        fileTypeList: typeof fileTypeList,
        pathList: I_File[],
        loading: boolean,
        popPusIsShow: false,
        treeObject: I_TreeNode,
        keyword: string,
    }>({
        directoryAndFileList: [[], []],
        fileTypeList,
        pathList: [],
        loading: false,
        popPusIsShow: false,
        treeObject: {
            title: "根路径",
            subDirectory: [],
            show: true,
            type: "",
            uuid: "",
            parentFolder: "",
        },
        keyword: "",
    });

    onMounted(async () => {
        let resData: I_ResData<I_File[]> = await api.subdirectoryApi("") as unknown as I_ResData<I_File[]>;
        classification(resData.data);
        await treeClick(null, []);
    });

    async function searchFile(): Promise<void> {
        if (state.keyword.trim() !== "") {
            let resData: I_ResData<I_File[]> = await api.searchFileApi(state.keyword) as unknown as I_ResData<I_File[]>;
            classification(resData.data);
        } else {
            await pathClick(null, 0);
        }
    }

    async function pathClick(fileObject: I_File | null, index: number) {
        state.loading = !state.loading;
        let sunDirUuid: string = fileObject === null ? "" : fileObject.fileUuid;
        let resData: I_ResData<I_File[]> = await api.subdirectoryApi(sunDirUuid) as unknown as I_ResData<I_File[]>;
        classification(resData.data);
        state.pathList = state.pathList.splice(0, index);
        state.loading = !state.loading;
    }

    async function treeClick(treeMode: I_TreeNode | null, pathList: Array<number>): Promise<void> {
        let sunDirUuid: string = treeMode === null ? "" : treeMode.uuid;
        let resData: I_ResData<I_File[]> = await api.subdirectoryApi(sunDirUuid) as unknown as I_ResData<I_File[]>;
        let tempList:I_TreeNode[] = [];
        for (let i = 0; i < resData.data.length; i++) {
            tempList.push({
                show: false,
                title: resData.data[i].fileName,
                uuid: resData.data[i].fileUuid,
                type: resData.data[i].fileType,
                parentFolder: resData.data[i].parentFolder,
                subDirectory: []
            });
        }
        if (pathList.length >= 2) {
            pathList.pop()              //长度差1
        }

        updateTree(state.treeObject, tempList, pathList);

        if (treeMode !== null && treeMode.title !== "根路径") {
            await nextFile({
                fileUuid: treeMode.uuid,
                fileType: treeMode.type,
                fileName: treeMode.title,
                parentFolder: treeMode.parentFolder,
            });
        }
    }

    function updateTree(sub: I_TreeNode, list: Array<I_TreeNode>, path: Array<number>) {
        if (path.length === 0 && sub.subDirectory.length === 0) {
            sub.subDirectory = list;
            return
        } else if (path.length === 0) return;
        let pop: undefined | number = path.pop();
        if (pop === undefined) return;
        updateTree(sub.subDirectory[pop], list, path);
    }

    function classification(dataList: I_File[]): void {
        let directoryList:I_File[] = [], fileList:I_File[] = [];
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
        state.directoryAndFileList[0] = (directoryList);
        state.directoryAndFileList[1] = (fileList);
    }

    async function nextFile(fileObject: I_File): Promise<void> {
        let fileType = fileObject["fileType"].toLowerCase();
        if (fileTypeList.directory.includes(fileType)) {
            state.loading = !state.loading;
            let fileUuid = fileObject.fileUuid;
            let resData: I_ResData<I_File[]> = await api.subdirectoryApi(fileUuid) as unknown as I_ResData<I_File[]>;
            classification(resData.data);
            state.pathList.push(fileObject);
            state.loading = !state.loading;
        } else if (fileTypeList.video.includes(fileType)) {
            //使用弹窗打开视频
            createPopUps(VideoPlayer, {
                title: fileObject.fileName,
                data: fileObject,
                popUpsId: "video",
            });
        } else if (fileTypeList.image.includes(fileType)) {
            let defaultIndex = 0, count = 0;
            let fileList = state.directoryAndFileList[1].filter((listItem: I_File) => {
                let states = fileTypeList.image.includes(listItem.fileType);
                if (listItem.fileUuid === fileObject.fileUuid) defaultIndex = count;
                if (states) count++;
                return states;
            });
            //使用弹窗打开图片
            createPopUps(ImagePopUps, {
                title: fileObject.fileName,
                data: {list: fileList, defaultIndex: defaultIndex},
                popUpsId: "image"
            })
        } else if (fileTypeList.document.includes(fileType)) {
            //使用弹窗打开文本
            createPopUps(DocumentView, {
                title: fileObject.fileName,
                data: fileObject,
                popUpsId: "document"
            })
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