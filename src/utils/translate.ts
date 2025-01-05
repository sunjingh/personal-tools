import axios from 'axios'
// 引入一个 MD5 加密库（例如 crypto-js）
import { MD5 } from 'crypto-js'

// 调用翻译 API
export async function translateText(text: string, targetLang = 'ja') {
  const apiKey = 'YOUR_API_KEY' // 替换为您的翻译 API 密钥
  const url = `https://api-free.deepl.com/v2/translate`
  const response = await axios.post(url, {
    auth_key: apiKey,
    text,
    target_lang: targetLang,
  })
  return response.data.translations[0].text
}

export async function translateBaidu(text: string, fromLang = 'auto', toLang = 'jp') {
  const appid = '20250105002245856' // 替换为你的 AppID
  const key = 'hWhKVRwHsP3X9I1yNNtB' // 替换为你的密钥
  const salt = Date.now() // 随机数
  const sign = MD5(appid + text + salt + key).toString() // 生成签名

  const url = '/api/api/trans/vip/translate'

  try {
    // 发送 GET 请求
    const response = await axios.get(url, {
      params: {
        q: text,
        from: fromLang,
        to: toLang,
        appid,
        salt,
        sign,
      },
    })

    const data = response.data

    // 检查翻译结果
    if (data.trans_result) {
      console.log('翻译结果:', data.trans_result[0].dst)
      return data.trans_result[0].dst
    } else {
      console.error('翻译失败:', data)
      return null
    }
  } catch (error) {
    console.error('请求出错:', error)
    return null
  }
}
