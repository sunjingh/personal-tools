<template>
  <div flex flex-col items-center>
    <div flex items-center mt-8 mb="8%">
      <h2>统计pdf中的字数</h2>
    </div>
    <el-row w="50%" :gutter="20">
      <el-col :span="12">
        <div flex flex-col justify-center mt-12>
          <FileUpload ref="$FileUpload" accept=".pdf" @change="handleFileChange" />
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
            <div mt-8 flex justify-between items-end>
              <div>
                <div text="14px" mb-2>排除标点符号</div>
                <ToggleSwitch v-model="isRemovePunctuation" @change="handleToggleSwitchChange" />
              </div>
              <el-button
                v-if="isSupported"
                type="primary"
                :disabled="!pageTextResult.length"
                @click="handleCopyClick"
              >
                复制内容
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
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from '/src/assets/pdf.worker.min.js?url'
import FileUpload from '@/components/buttons/FileUpload.vue'
import { useClipboard } from '@vueuse/core'

// 设置 PDF.js 的 Worker 路径
// pdfjsLib.GlobalWorkerOptions.workerSrc = '/src/assets/pdf.worker.min.js'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const pageNum = ref(0)
const wordCount = ref(0)
const fileName = ref('文件信息')
// 是否移除标点符号
const isRemovePunctuation = ref(false)
const loading = ref(false)
const pageTextResult = ref<string>('')

const $FileUpload = ref<InstanceType<typeof FileUpload> | null>(null)

async function handleFileChange(event: Event) {
  loading.value = true
  fileName.value = '文件信息'
  wordCount.value = 0
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) {
    fileName.value = file.name
    const reader = new FileReader()
    reader.onload = async function () {
      const arrayBuffer = reader.result
      if (arrayBuffer) {
        const countResult = await countWordsInPDF(arrayBuffer)
        wordCount.value = countResult?.wordCount ?? 0
        pageNum.value = countResult?.pageNum ?? 0
        loading.value = false
      }
    }
    reader.readAsArrayBuffer(file)
  }
}

// 读取 PDF 并统计字数的函数
async function countWordsInPDF(pdfSrc: string | URL | ArrayBuffer) {
  try {
    // 加载 PDF 文档
    const pdfDoc = await pdfjsLib.getDocument(pdfSrc).promise

    let wordCount = 0

    pageTextResult.value = ''

    const numPages = pdfDoc.numPages

    // 遍历每一页
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i)

      // 获取页面内容
      const textContent = await page.getTextContent()

      console.log('textContent===>', textContent)

      // 提取文本
      const pageText = textContent.items
        .map(
          (item) =>
            (
              item as {
                str: string
              }
            ).str,
        )
        .join(' ')

      pageTextResult.value += `${pageText}\n`
    }
    // 统计字数
    wordCount = normalizeText(pageTextResult.value, isRemovePunctuation.value)?.length ?? 0

    return { wordCount, pageNum: numPages }
  } catch (err) {
    console.error('读取 PDF 出错:', err)
  }
}

function handleToggleSwitchChange() {
  wordCount.value = normalizeText(pageTextResult.value, isRemovePunctuation.value)?.length ?? 0
}

const { copy, copied, isSupported } = useClipboard({ source: pageTextResult })
function handleCopyClick() {
  if (pageTextResult.value?.length > 0) {
    copy().then(() => {
      if (copied.value) ElMessage.success('复制成功')
    })
  }
}
</script>

<style scoped lang="scss"></style>
