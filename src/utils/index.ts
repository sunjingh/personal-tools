/**
 * 文本处理函数
 * 该函数主要用于处理给定的字符串，通过替换和移除特定字符来简化文本
 * 主要用途包括：数据预处理、文本清理等
 *
 * @param str 输入的字符串，是函数处理的对象
 * @param isRemovePunctuation 是否移除标点符号，默认为false
 * 当设置为true时，函数会移除文本中的标点符号和特定的中文标点
 * 当设置为false时，函数仅移除空格和省略号
 *
 * @returns 返回处理后的字符串
 */
export function normalizeText(str: string, isRemovePunctuation = false) {
  // 1. 将连续的数字或字母替换为单个字符
  const processedText = str.replace(/[\da-zA-Z]+/g, 'x')

  // 2. 清理文本：去除空格、标点符号以及点点点
  const cleanText = isRemovePunctuation
    ? processedText.replace(/[\s.,;:!?'"、，。；：！？《》“”‘’（）【】…—\-]/g, '')
    : processedText.replace(/[\s.…]/g, '')

  return cleanText
}
