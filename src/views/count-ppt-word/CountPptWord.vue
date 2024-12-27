<template>
  <div flex flex-col items-center>
    <div flex items-center mt-8 mb="8%">
      <h2>统计ppt中的字数</h2>
    </div>
    <el-row w="50%" :gutter="20">
      <el-col :span="12">
        <div center mt-12>
          <FileUpload accept=".pptx" @change="handleFileChange" />
        </div>
      </el-col>
      <el-col :span="12">
        <CcCard v-loading="loading" element-loading-text="加载中...">
          <div flex flex-col justify-around h-full p-6>
            <el-descriptions :title="fileName" :column="1">
              <el-descriptions-item label="字数：">
                <el-tag>
                  <span text="20px">{{ wordCount }}</span>
                </el-tag>
                <span ml-2>个字</span>
              </el-descriptions-item>
              <el-descriptions-item label="页数：">
                <el-tag>
                  <span text="20px">{{ pageNum }}</span>
                </el-tag>
                <span ml-2>页</span>
              </el-descriptions-item>
            </el-descriptions>
            <div>
              <div text="14px" mb-2>排除标点符号</div>
              <ToggleSwitch v-model="isRemovePunctuation" @change="handleToggleSwitchChange" />
            </div>
          </div>
        </CcCard>
      </el-col>
    </el-row>
    <GoBack mt="10%">返回</GoBack>
  </div>
</template>

<script setup lang="ts">
import { normalizeText } from '@/utils'
// @ts-expect-error pptx-parser 模块未提供类型定义文件
import parse from 'pptx-parser'

const pageNum = ref(0)
const wordCount = ref(0)
const fileName = ref('文件信息')
// 是否移除标点符号
const isRemovePunctuation = ref(false)
const loading = ref(false)
const pageTextResult = ref<string>('')

async function handleFileChange(event: Event) {
  loading.value = true
  fileName.value = '文件信息'
  wordCount.value = 0
  pageTextResult.value = ''
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) {
    if (file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      // 清空 input 的值
      (event.target as HTMLInputElement).value = ''
      ElNotification({
        title: '只支持pptx格式',
        message: '若是ppt类型，请先转换成pptx格式',
        type: 'error',
      })
      return
    }

    fileName.value = file.name

    const pptJson = await parse(file)

    loading.value = false

    pageNum.value = pptJson.slides.length

    const textRunList = extractTextRunValues(pptJson)

    textRunList.forEach((ele) => {
      pageTextResult.value += ele.content
    })

    wordCount.value = countWords(pageTextResult.value)
  }

}

interface TextRunObj {
  textRun: ResultItem // textRun 属性的类型为ResultItem
  [key: string]: unknown // 其他可选的属性，可以是任意类型
}
interface ResultItem {
  content: string // content 属性的类型为字符串
  [key: string]: unknown // 其他可选的属性，可以是任意类型
}

function extractTextRunValues(obj: TextRunObj): ResultItem[] {
  const result: ResultItem[] = []
  function recurse(current: TextRunObj): void {
    if (typeof current !== "object" || current === null) return

    for (const key in current) {
      if (current[key]) {
        if (key === "textRun") {
          result.push(current[key]) // 如果是 textRun 属性且值为字符串，提取其值
        } else if (typeof current[key] === "object") {
          recurse(current[key] as TextRunObj) // 递归遍历子对象
        }
      }

    }
  }
  recurse(obj)
  return result
}

function countWords(text: string) {
  if (typeof text !== "string") return 0

  const textTemp = normalizeText(text)

  // 正则表达式：匹配英文单词、中文字符、数字
  if (!/[\u4e00-\u9fa5]+/.test(textTemp)) {
    return textTemp.split(' ').length
  }

  // 如果没有匹配项，返回 0
  return textTemp.length
}

function handleToggleSwitchChange() {
  wordCount.value = normalizeText(pageTextResult.value, isRemovePunctuation.value)?.length
}
</script>

<style scoped lang="scss"></style>
