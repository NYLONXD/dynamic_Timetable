export default function Topbar() {
  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-900 border-b px-6 py-3 shadow-sm">
      <h2 className="text-lg font-semibold">Dynamic Timetable</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Hello, Admin 👋</span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
      </div>
    </header>
  )
}
