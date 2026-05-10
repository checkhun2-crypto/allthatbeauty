import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

export default function BottomNav({ items }) {
  return (
    <nav className={styles.nav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
          end={item.end}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
