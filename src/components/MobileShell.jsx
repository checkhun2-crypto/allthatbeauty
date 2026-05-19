import styles from './MobileShell.module.css'

export default function MobileShell({
  title,
  headerRight,
  children,
  footer,
  hideHeaderTitle = false,
  viewportClassName = '',
  mainClassName = '',
}) {
  return (
    <div className={`${styles.viewport} ${viewportClassName}`.trim()}>
      <div className={styles.shell}>
        <header className={styles.header}>
          {hideHeaderTitle ? (
            <span className={styles.titlePlaceholder} aria-hidden />
          ) : (
            <h1 className={styles.title}>{title}</h1>
          )}
          {headerRight ? <div className={styles.headerRight}>{headerRight}</div> : null}
        </header>
        <main className={`${styles.main} ${mainClassName}`.trim()}>{children}</main>
        {footer}
      </div>
    </div>
  )
}
