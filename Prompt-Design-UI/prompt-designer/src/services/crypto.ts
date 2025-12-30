/**
 * API Key 加密服务
 *
 * 使用 Web Crypto API 的 AES-GCM 算法进行加密
 * 密钥派生使用 PBKDF2 算法
 */

// 用于密钥派生的固定盐值（在生产环境中应该使用随机盐并存储）
const SALT = new TextEncoder().encode('prompt-designer-salt-v1')
// 迭代次数
const ITERATIONS = 100000
// 密钥长度（位）
const KEY_LENGTH = 256

/**
 * 从密码派生加密密钥
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // 导入密码作为原始密钥
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // 派生 AES-GCM 密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 获取或创建设备唯一标识符作为加密密码
 * 使用 localStorage 存储，确保同一设备上的密钥一致
 */
function getDeviceSecret(): string {
  const STORAGE_KEY = 'prompt-designer-device-secret'
  let secret = localStorage.getItem(STORAGE_KEY)

  if (!secret) {
    // 生成随机设备密钥
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    secret = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem(STORAGE_KEY, secret)
  }

  return secret
}

/**
 * 加密 API Key
 * @param apiKey 明文 API Key
 * @returns 加密后的字符串（Base64 编码）
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  if (!apiKey) return ''

  try {
    const secret = getDeviceSecret()
    const key = await deriveKey(secret)
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)

    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // 加密
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    // 组合 IV 和加密数据
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    // 转换为 Base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Failed to encrypt API key:', error)
    throw new Error('加密失败')
  }
}

/**
 * 解密 API Key
 * @param encryptedKey 加密的 API Key（Base64 编码）
 * @returns 解密后的明文 API Key
 */
export async function decryptApiKey(encryptedKey: string): Promise<string> {
  if (!encryptedKey) return ''

  try {
    const secret = getDeviceSecret()
    const key = await deriveKey(secret)

    // 从 Base64 解码
    const combined = new Uint8Array(
      atob(encryptedKey)
        .split('')
        .map((c) => c.charCodeAt(0))
    )

    // 分离 IV 和加密数据
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Failed to decrypt API key:', error)
    throw new Error('解密失败')
  }
}

/**
 * 验证 API Key 格式
 */
export function validateApiKey(
  provider: string,
  apiKey: string
): { valid: boolean; message?: string } {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, message: 'API Key 不能为空' }
  }

  switch (provider) {
    case 'anthropic':
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, message: 'Anthropic API Key 应以 sk-ant- 开头' }
      }
      break
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, message: 'OpenAI API Key 应以 sk- 开头' }
      }
      break
    case 'google':
      if (apiKey.length < 20) {
        return { valid: false, message: 'Google API Key 格式不正确' }
      }
      break
    case 'deepseek':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, message: 'DeepSeek API Key 应以 sk- 开头' }
      }
      break
  }

  return { valid: true }
}

/**
 * 掩码显示 API Key（只显示前缀和后几位）
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) return '***'
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`
}
