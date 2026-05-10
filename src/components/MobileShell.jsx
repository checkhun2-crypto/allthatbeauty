import styles from './MobileShell.module.css'

export default function MobileShell({ title, headerRight, children, footer }) {
  return (
    <div className={styles.viewport}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {headerRight ? <div className={styles.headerRight}>{headerRight}</div> : null}
        </header>
        <main className={styles.main}>{children}</main>
        {footer}
      </div>
    </div>
  )
}
