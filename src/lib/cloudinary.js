const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export function isCloudinaryConfigured() {
  return Boolean(CLOUD && PRESET)
}

export function cloudinaryConfigHint() {
  return 'Cloudinary 업로드 preset이 필요합니다. .env에 VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET을 설정하고 콘솔에서 Unsigned preset을 만드세요.'
}

/**
 * @param {File} file
 * @param {{ resourceType?: 'image'|'video', folder?: string, onProgress?: (pct: number) => void }} opts
 */
export function uploadToCloudinary(file, opts = {}) {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new Error(cloudinaryConfigHint()))
  }
  const resourceType = opts.resourceType ?? (file.type.startsWith('video/') ? 'video' : 'image')
  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', PRESET)
  if (opts.folder) form.append('folder', opts.folder)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })
    xhr.addEventListener('load', () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
            bytes: data.bytes,
          })
        } else {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err?.error?.message || 'Cloudinary 업로드에 실패했습니다.'))
        }
      } catch {
        reject(new Error('업로드 응답을 처리할 수 없습니다.'))
      }
    })
    xhr.addEventListener('error', () => reject(new Error('네트워크 오류로 업로드에 실패했습니다.')))
    xhr.open('POST', url)
    xhr.send(form)
  })
}

/**
 * @param {File[]} files
 * @param {{ folder?: string, onProgress?: (overallPct: number, fileIndex: number, fileCount: number) => void }} opts
 */
export async function uploadFilesToCloudinary(files, opts = {}) {
  const list = [...files]
  const out = []
  for (let i = 0; i < list.length; i++) {
    const file = list[i]
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
    const result = await uploadToCloudinary(file, {
      folder: opts.folder,
      resourceType,
      onProgress: (filePct) => {
        const overall = Math.round(((i + filePct / 100) / list.length) * 100)
        opts.onProgress?.(overall, i, list.length)
      },
    })
    out.push({ ...result, file })
    opts.onProgress?.(Math.round(((i + 1) / list.length) * 100), i, list.length)
  }
  return out
}
