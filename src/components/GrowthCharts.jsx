import LineChart from './LineChart.jsx'
import ColoredAttendanceRings from './ColoredAttendanceRings.jsx'
import styles from './GrowthCharts.module.css'
import { monthlyPracticePoints } from '../lib/practiceStats.js'
import {
  currentMonthKey,
  formatMonthLabel,
  monthlyAttendanceRate,
  overallAttendanceRate,
} from '../lib/parentStats.js'

const DEFAULT_EMPTY_PRACTICE = '연습 타이머를 사용하면 그래프가 표시됩니다'

export default function GrowthCharts({
  student,
  emptyPracticeMessage = DEFAULT_EMPTY_PRACTICE,
}) {
  if (!student) {
    return <p className={styles.empty}>학생 정보를 불러올 수 없습니다.</p>
  }

  const monthKey = currentMonthKey()
  const monthRate = monthlyAttendanceRate(student, monthKey)
  const overallRate = overallAttendanceRate(student)
  const monthLabel = formatMonthLabel(monthKey)
  const practicePts = monthlyPracticePoints(student.practiceSecondsByDate)

  return (
    <div className={styles.wrap}>
      <section className={styles.block}>
        <h3 className={styles.blockTitle}>월별 연습량</h3>
        {practicePts.length > 0 ? (
          <div className={styles.chartBox}>
            <LineChart points={practicePts} valueLabel="연습 시간 (시간)" />
          </div>
        ) : (
          <p className={styles.empty}>{emptyPracticeMessage}</p>
        )}
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>출석률</h3>
        <ColoredAttendanceRings
          monthRate={monthRate}
          monthLabel={monthLabel}
          overallRate={overallRate}
        />
      </section>
    </div>
  )
}
