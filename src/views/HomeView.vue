<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <div>
      <span>字数：</span>
      <span>{{ wordCount }}</span>
    </div>
    <div>
      <span>页数：</span>
      <span>{{ pageNum }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error pptx-parser 模块未提供类型定义文件
import parse from 'pptx-parser'
import { ref } from 'vue';

const pageNum = ref(0)
const wordCount = ref(0)

async function handleFileChange(e: Event) {
  wordCount.value = 0
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (file) {
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

<style scoped></style>
