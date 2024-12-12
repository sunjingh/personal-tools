<template>
  <div flex flex-col items-center>
    <h2 mt-8 mb="12%">统计ppt中的字数</h2>
    <el-row w="50%" :gutter="20">
      <el-col :span="12">
        <div center mt-12>
          <div w-200px class="choose-file-container">
            <div class="folder">
              <div class="front-side">
                <div class="tip"></div>
                <div class="cover"></div>
              </div>
              <div class="back-side cover"></div>
            </div>
            <label class="custom-file-upload">
              <input class="title" type="file" @change="handleFileChange" />
              选择文件
            </label>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="info-card">
          <div class="bg" flex items-center px-6>
            <el-descriptions :title="fileName" :column="1">
              <el-descriptions-item label="字数：">
                <el-tag size="small">{{ wordCount }}</el-tag>
                <span ml-2>个字</span>
              </el-descriptions-item>
              <el-descriptions-item label="页数：">
                <el-tag size="small">{{ pageNum }}</el-tag>
                <span ml-2>页</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="blob"></div>
        </div>
      </el-col>
    </el-row>
  </div>

</template>

<script setup lang="ts">
// @ts-expect-error pptx-parser 模块未提供类型定义文件
import parse from 'pptx-parser'

const pageNum = ref(0)
const wordCount = ref(0)
const fileName = ref('文件信息')

async function handleFileChange(e: Event) {
  fileName.value = '文件信息'
  wordCount.value = 0
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (file) {
    fileName.value = file.name

    const pptJson = await parse(file)

    pageNum.value = pptJson.slides.length

    const textRunList = extractTextRunValues(pptJson)

    textRunList.forEach((ele) => {
      wordCount.value += countWords(ele.content);
    });
  }

}

interface TextRunObj {
  textRun: ResultItem; // textRun 属性的类型为ResultItem
  [key: string]: unknown; // 其他可选的属性，可以是任意类型
}
interface ResultItem {
  content: string; // content 属性的类型为字符串
  [key: string]: unknown; // 其他可选的属性，可以是任意类型
}

function extractTextRunValues(obj: TextRunObj): ResultItem[] {
  const result: ResultItem[] = [];

  function recurse(current: TextRunObj): void {
    if (typeof current !== "object" || current === null) return;

    for (const key in current) {
      if (current[key]) {
        if (key === "textRun") {
          result.push(current[key]); // 如果是 textRun 属性且值为字符串，提取其值
        } else if (typeof current[key] === "object") {
          recurse(current[key] as TextRunObj); // 递归遍历子对象
        }
      }

    }
  }

  recurse(obj);
  return result;
}

function countWords(text: string) {
  if (typeof text !== "string") return 0;

  const textTemp = text.replace(/\s+/g, '');

  // 正则表达式：匹配英文单词、中文字符、数字
  if (!/[\u4e00-\u9fa5]+/.test(textTemp)) {
    return textTemp.split(' ').length
  }

  // 如果没有匹配项，返回 0
  return textTemp.length;
}
</script>

<style scoped lang="scss">
.choose-file-container {
  --transition: 350ms;
  --folder-W: 120px;
  --folder-H: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 10px;
  background: linear-gradient(135deg, #6dd5ed, #2193b0);
  border-radius: 15px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  height: calc(var(--folder-H) * 1.7);
  position: relative;

  &:hover .back-side::before {
    transform: rotateX(-5deg) skewX(5deg);
  }

  &:hover .back-side::after {
    transform: rotateX(-15deg) skewX(12deg);
  }

  &:hover .front-side {
    transform: rotateX(-40deg) skewX(15deg);
  }

  .folder {
    position: absolute;
    top: -20px;
    left: calc(50% - 60px);
    animation: float 2.5s infinite ease-in-out;
    transition: transform var(--transition) ease;
  }

  .folder:hover {
    transform: scale(1.05);
  }

  .folder .front-side,
  .folder .back-side {
    position: absolute;
    transition: transform var(--transition);
    transform-origin: bottom center;
  }

  .folder .back-side::before,
  .folder .back-side::after {
    content: "";
    display: block;
    background-color: white;
    opacity: 0.5;
    z-index: 0;
    width: var(--folder-W);
    height: var(--folder-H);
    position: absolute;
    transform-origin: bottom center;
    border-radius: 15px;
    transition: transform 350ms;
    z-index: 0;
  }

  .folder .front-side {
    z-index: 1;
  }

  .folder .tip {
    background: linear-gradient(135deg, #ff9a56, #ff6f56);
    width: 80px;
    height: 20px;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    position: absolute;
    top: -10px;
    z-index: 2;
  }

  .folder .cover {
    background: linear-gradient(135deg, #ffe563, #ffc663);
    width: var(--folder-W);
    height: var(--folder-H);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }

  .custom-file-upload {
    font-size: 1.1em;
    color: #ffffff;
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background var(--transition) ease;
    display: inline-block;
    width: 100%;
    padding: 10px 35px;
    position: relative;
  }

  .custom-file-upload:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  .custom-file-upload input[type="file"] {
    display: none;
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(-20px);
    }

    100% {
      transform: translateY(0px);
    }
  }
}

.info-card {
  position: relative;
  width: 500px;
  height: 250px;
  border-radius: 14px;
  z-index: 1111;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;

  .bg {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 490px;
    height: 240px;
    z-index: 2;
    background: rgba(255, 255, 255, .95);
    backdrop-filter: blur(24px);
    border-radius: 10px;
    overflow: hidden;
    outline: 2px solid white;
  }

  .blob {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: 550px;
    height: 150px;
    border-radius: 50%;
    background-color: #2193b0;
    opacity: 1;
    filter: blur(12px);
    animation: blob-bounce 5s infinite linear;
  }

  @keyframes blob-bounce {
    0% {
      transform: translate(-100%, -100%) translate3d(0, 0, 0);
    }

    25% {
      transform: translate(-100%, -100%) translate3d(100%, 0, 0);
    }

    50% {
      transform: translate(-100%, -100%) translate3d(100%, 100%, 0);
    }

    75% {
      transform: translate(-100%, -100%) translate3d(0, 100%, 0);
    }

    100% {
      transform: translate(-100%, -100%) translate3d(0, 0, 0);
    }
  }
}
</style>
