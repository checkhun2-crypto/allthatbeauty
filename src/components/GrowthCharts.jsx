import LineChart from './LineChart.jsx'

export default function GrowthCharts({ monthlyScores, monthlyAttendance }) {
  const scorePts = (monthlyScores ?? []).map((r) => ({
    label: r.month.slice(5),
    value: r.score,
  }))
  const attPts = (monthlyAttendance ?? []).map((r) => ({
    label: r.month.slice(5),
    value: r.rate,
  }))
  return (
    <>
      <LineChart title="월별 실기 점수" points={scorePts} valueLabel="점수(100점 만점)" />
      <div style={{ height: 14 }} />
      <LineChart title="월별 출석률" points={attPts} valueLabel="출석률(%)" />
    </>
  )
}
