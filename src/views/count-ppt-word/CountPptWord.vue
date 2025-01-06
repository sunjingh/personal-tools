<template>
  <div flex flex-col items-center>
    <div flex items-center mt-8 mb="8%">
      <h2>统计ppt中的字数</h2>
    </div>
    <el-row w="50%" :gutter="20">
      <el-col :span="12">
        <div h-full center>
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
            </div>
          </div>
        </CcCard>
        <CcCard mt-3>
          <div flex flex-col justify-around h-full p-6>
            <h3>转换进度：</h3>
            <el-progress :text-inside="true" :stroke-width="18" :percentage="convertProgress" />
            <div flex items-center gap-2>
              <span>目标字体：</span>
              <el-select v-model="fontName" style="width: 100px">
                <el-option v-for="item in fontOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <span>翻译工具：</span>
              <el-select v-model="translateApiType" style="width: 100px">
                <el-option v-for="item in translateApiTypeOptions" :key="item.value" :label="item.label"
                  :value="item.value" />
              </el-select>
            </div>
            <div flex items-end>
              <el-button type="warning" :disabled="!pageTextResult.length" @click="handleConvertClick">
                转换文件
              </el-button>
              <el-button type="primary" :disabled="convertProgress < 100" @click="handleDownloadClick">
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
import { round } from 'lodash-es'
import { ETranslateApiType } from '@/types'

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
      ; (event.target as HTMLInputElement).value = ''
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

interface TextSpansObj {
  order: number // textRun 属性的类型为ResultItem
  textRun: ResultItem
  [key: string]: unknown // 其他可选的属性，可以是任意类型
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

  const translateList: Array<{ originalText: string; originalTextRegStr: string; slideFile: string }> = []

  async function recurse(obj: Record<string, unknown>, slideFile: string) {
    if (typeof obj !== 'object' || obj === null) return

    for (const key in obj) {
      if (obj[key]) {
        if (key === 'textSpans') {
          const textSpans = obj[key] as Array<TextSpansObj>
          // 这里进行翻译，只替换文本内容
          const originalText = textSpans.map(ele => ele.textRun?.content ?? '').join('').replace(/\/32/g, "")
          const originalTextRegStr = textSpans.map(ele => ele.textRun?.content?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') ?? '').filter(ele => Boolean(ele.replace(/\s+/g, ""))).join('.*?').replace(/\/32/g, "")

          // 如果翻译成功，则替换原文本
          if (originalText.trim()) {
            translateList.push({ originalText, originalTextRegStr, slideFile })
          }
        } else if (typeof obj[key] === 'object') {
          await recurse(obj[key] as Record<string, unknown>, slideFile) // 递归遍历子对象
        }
      }
    }
  }

  // 遍历所有幻灯片
  for (const [index, slideFile] of slideFiles.entries()) {
    await recurse(pptData.slides[index], slideFile)
  }

  // console.log('translateList===>', translateList)

  for (const [index, element] of translateList.entries()) {
    await translate(element.originalText, element.originalTextRegStr, element.slideFile)
    convertProgress.value = round((index + 1) / translateList.length * 100, 2)
  }

  async function translate(originalText: string, originalTextRegStr: string, slideFile: string) {
    let translatedText = ''
    switch (translateApiType.value) {
      case ETranslateApiType.BAIDU:
        translatedText = await translateBaidu(originalText) // 进行实际翻译
        break
      default:
        translatedText = await translateBaidu(originalText) // 进行实际翻译
    }
    // const translatedText = `${originalText}哈哈哈` // 进行实际翻译

    // 获取对应的 slideXml 内容
    const slideXml = await pptxContent.files[slideFile].async('text')

    // console.log('slideXml===>', slideXml)
    // 修改字号
    let updatedSlideXml = slideXml.replace(
      /<a:rPr([^>]*?)sz="(\d+)"([^>]*?)>/g,
      (match, before, originalSize, after) => {
        const newSize = fontSize ? `${fontSize * 100}` : originalSize // 使用传入值或原有值
        return `<a:rPr${before}sz="${newSize}"${after}>`
      },
    )

    // 修改lang、altLang
    updatedSlideXml = slideXml.replace(
      /<a:rPr([^>]*?)lang=".+?" altLang=".+?"([^>]*?)>/g,
      (match, before, after) => {
        return `<a:rPr${before}lang="zh-CN" altLang="en-US"${after}>`
      },
    )

    // 修改字体
    updatedSlideXml = slideXml.replace(
      /<(a:ea|a:latin)([^>]*?)\btypeface="[^"]*"(.*?)>/g,
      (match, tag, before, after) => {
        // 如果存在 typeface，则替换为指定值
        return `<${tag}${before}typeface="${fontName}"${after}>`;
      }
    ).replace(
      /<(a:ea|a:latin)((?:(?!\btypeface=).)*?)>/g,
      (match, tag, before) => {
        // 如果不存在 typeface，则添加指定值
        return `<${tag}${before} typeface="${fontName}">`;
      }
    );

    // 仅替换匹配的文本内容
    updatedSlideXml = updatedSlideXml.replace(
      new RegExp(`<a:t>${originalTextRegStr}</a:t>`, 'g'), // 只替换原文匹配的部分
      `<a:t>${translatedText}</a:t>`,
    )

    pptxContent.file(slideFile, updatedSlideXml) // 更新 PPTX 内容
  }

  // 生成新的 PPT 文件
  return pptxContent.generateAsync({ type: 'blob' })
}

const thisUpdatedPptx = ref<Blob>()
const convertProgress = ref(0)
const fontName = ref('MS Gothic') // 设置日文字体 MS Mincho, MS Gothic, Meiryo UI, 华文彩云
const fontOptions = [
  { label: 'MS Mincho', value: 'MS Mincho' },
  { label: 'MS Gothic', value: 'MS Gothic' },
  { label: 'Meiryo UI', value: 'Meiryo UI' },
  { label: '华文彩云', value: '华文彩云' },
]
const translateApiType = ref<ETranslateApiType>(ETranslateApiType.BAIDU)
const translateApiTypeOptions = [
  { label: '百度翻译', value: ETranslateApiType.BAIDU },
]
async function handleConvertClick() {
  const fontSize = 0 // 设置字体大小

  const updatedPptx = await processPptx(thisFile.value!, fontName.value, fontSize)
  thisUpdatedPptx.value = updatedPptx
}

async function handleDownloadClick() {
  // 提供下载
  const link = document.createElement('a')
  link.href = URL.createObjectURL(thisUpdatedPptx.value!)
  link.download = `${fileName.value}-translated.pptx`
  link.click()
}
</script>

<style scoped lang="scss"></style>
