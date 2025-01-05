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
            <div flex justify-between items-end>
              <div>
                <div text="14px" mb-2>排除标点符号</div>
                <ToggleSwitch v-model="isRemovePunctuation" @change="handleToggleSwitchChange" />
              </div>
              <el-button
                type="primary"
                :disabled="!pageTextResult.length"
                @click="handleDownloadClick"
              >
                下载文件
              </el-button>
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
import { translateBaidu } from '@/utils/translate'
// @ts-expect-error pptx-parser 模块未提供类型定义文件
import parse from 'pptx-parser'
import JSZip from 'jszip'

const pageNum = ref(0)
const wordCount = ref(0)
const fileName = ref('文件信息')
// 是否移除标点符号
const isRemovePunctuation = ref(false)
const loading = ref(false)
const pageTextResult = ref<string>('')
const thisFile = ref<File | undefined>(undefined)

async function handleFileChange(event: Event) {
  loading.value = true
  fileName.value = '文件信息'
  wordCount.value = 0
  pageTextResult.value = ''
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) {
    if (file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      // 清空 input 的值
      ;(event.target as HTMLInputElement).value = ''
      ElNotification({
        title: '只支持pptx格式',
        message: '若是ppt类型，请先转换成pptx格式',
        type: 'error',
      })
      return
    }

    thisFile.value = file

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
    if (typeof current !== 'object' || current === null) return

    for (const key in current) {
      if (current[key]) {
        if (key === 'textRun') {
          result.push(current[key]) // 如果是 textRun 属性且值为字符串，提取其值
        } else if (typeof current[key] === 'object') {
          recurse(current[key] as TextRunObj) // 递归遍历子对象
        }
      }
    }
  }
  recurse(obj)
  return result
}

function countWords(text: string) {
  if (typeof text !== 'string') return 0

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

// 处理 PPTX 文件
async function processPptx(file: File, fontName: string, fontSize?: number) {
  const pptData = await parse(file)
  const zip = new JSZip()
  const pptxContent = await zip.loadAsync(file)

  // 定位幻灯片文件路径
  const slideFiles = Object.keys(pptxContent.files).filter((path) =>
    path.startsWith('ppt/slides/slide'),
  )

  async function recurse(current: TextRunObj, slideFile: string) {
    if (typeof current !== 'object' || current === null) return

    for (const key in current) {
      if (current[key]) {
        if (key === 'textRun' && current[key].content) {
          // 这里进行翻译，只替换文本内容
          const originalText = current[key].content
          // const translatedText = await translateBaidu(originalText) // 进行实际翻译
          const translatedText = originalText // 进行实际翻译

          console.log('translatedText===>', translatedText)

          // 如果翻译成功，则替换原文本
          if (translatedText) {
            // 获取对应的 slideXml 内容
            const slideXml = await pptxContent.files[slideFile].async('text')

            // 修改字体和字号
            let updatedSlideXml = slideXml.replace(
              /<a:rPr([^>]*?)sz="(\d+)"([^>]*?)>/g,
              (match, before, originalSize, after) => {
                const newSize = fontSize ? `${fontSize * 100}` : originalSize // 使用传入值或原有值
                return `<a:rPr${before}sz="${newSize}" typeface="${fontName}"${after}>`
              },
            )

            // 仅替换匹配的文本内容
            updatedSlideXml = updatedSlideXml.replace(
              new RegExp(`<a:t>${originalText}</a:t>`, 'g'), // 只替换原文匹配的部分
              `<a:t>${translatedText}</a:t>`,
            )

            pptxContent.file(slideFile, updatedSlideXml) // 更新 PPTX 内容
          }
        } else if (typeof current[key] === 'object') {
          await recurse(current[key] as TextRunObj, slideFile) // 递归遍历子对象
        }
      }
    }
  }

  // 遍历所有幻灯片
  for (const slideFile of slideFiles) {
    await recurse(pptData, slideFile)
  }

  // 生成新的 PPT 文件
  const updatedPptx = await pptxContent.generateAsync({ type: 'blob' })
  return updatedPptx
}

async function handleDownloadClick() {
  const fontName = 'MS Mincho' // 设置日文字体 MS Mincho, Ms Gothic, Meiryo UI
  const fontSize = 0 // 设置字体大小

  const updatedPptx = await processPptx(thisFile.value!, fontName, fontSize)
  // 提供下载
  const link = document.createElement('a')
  link.href = URL.createObjectURL(updatedPptx)
  link.download = 'translated.pptx'
  link.click()
}
</script>

<style scoped lang="scss"></style>
@/utils/translate-api
