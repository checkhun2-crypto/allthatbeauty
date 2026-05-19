import GrowthCharts from '../../components/GrowthCharts.jsx'

/** 수강생 홈 성장 그래프 — 학부모 화면과 동일 구성 */
export default function StudentGrowthSection({ student }) {
  return (
    <GrowthCharts
      student={student}
      emptyPracticeMessage="연습 타이머를 사용하면 그래프가 표시됩니다"
    />
  )
}
