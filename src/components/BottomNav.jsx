import { NavLink } from 'react-router-dom'
import ParentNavIcon from './ParentNavIcon.jsx'
import styles from './BottomNav.module.css'

export default function BottomNav({ items, tone = 'default' }) {
  const navClass = tone === 'parent' ? `${styles.nav} ${styles.navParent}` : styles.nav
  const isParent = tone === 'parent'

  return (
    <nav className={navClass}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => {
            if (isParent) {
              return isActive ? `${styles.link} ${styles.linkParentActive}` : `${styles.link} ${styles.linkParent}`
            }
            return isActive ? styles.linkActive : styles.link
          }}
          end={item.end}
        >
          <span className={styles.iconWrap}>
            {isParent && item.iconName ? (
              <ParentNavIcon name={item.iconName} />
            ) : (
              <span className={styles.emojiIcon}>{item.icon}</span>
            )}
          </span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
