/**
 * Anthropic Claude — 미용 이론 전문가 페르소나
 * 키: 환경변수 VITE_ANTHROPIC_API_KEY
 */
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PERSONA = `당신은 대한민국 미용 교육 현장을 기준으로 활동하는 「미용 이론」 전문가입니다.

역할과 말투:
- 피부과학·스킨케어, 메이크업(베이스·색조·교정), 헤어(두피·컷·펌·염색 이론), 네일(재료·위생·시술 순서), 샵 위생·소독·도구 관리 등 교과서적 이론과 안전한 실무 원칙을 한국어로 명확히 설명합니다.
- 전문 용어는 필요 시 짧게 풀어서 덧붙입니다.
- 의료 진단·처방·약물 용량, 성형·시술 의학적 지시는 하지 않습니다. 그런 질문에는 일반 교육 맥락에서의 이론만 안내하고 전문의 상담을 권합니다.

답변 형식:
- 질문 의도에 맞게 단계나 목록으로 정리해도 좋습니다.
- 근거가 애매하면 전제(피부 타입, 도구, 제품 특성 등)를 짚고 답합니다.`

function mockReply(q) {
  const ko = String(q ?? '').trim()
  if (!ko) return '질문을 입력해 주세요.'
  return `${ko.slice(0, 60)}${ko.length > 60 ? '…' : ''}에 대한 답변을 준비하려면 프로젝트 루트에 .env 파일을 만들고 VITE_ANTHROPIC_API_KEY를 설정한 뒤 개발 서버를 다시 실행해 주세요. (브라우저에 API 키가 노출되므로 운영 배포 시에는 백엔드 프록시 사용을 권장합니다.)`
}

/**
 * @param {Array<{ role: string, content: string }>} history user/assistant 만 포함, 마지막은 보통 현재 user 턴
 */
export async function askBeautyTheory(history) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || !String(key).trim()) {
    await new Promise((r) => setTimeout(r, 300))
    const lastUser = [...(history ?? [])].reverse().find((m) => m.role === 'user')
    return mockReply(lastUser?.content ?? '')
  }

  const msgs = (history ?? [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? ''),
    }))

  if (!msgs.length) {
    throw new Error('대화 내용이 비어 있습니다.')
  }

  const model =
    import.meta.env.VITE_ANTHROPIC_MODEL?.trim() || 'claude-3-5-sonnet-20241022'

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': String(key).trim(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: SYSTEM_PERSONA,
      messages: msgs,
    }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const errBody = await res.json()
      detail = errBody?.error?.message || JSON.stringify(errBody)
    } catch {
      detail = await res.text()
    }
    throw new Error(detail || `요청 실패 (${res.status})`)
  }

  const data = await res.json()
  const blocks = data.content
  if (!Array.isArray(blocks)) throw new Error('응답 형식 오류')

  const text = blocks
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()

  if (!text) throw new Error('빈 응답')
  return text
}
