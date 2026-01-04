import { Search, Bell } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export default function Topbar() {
  return (
    <header className="h-16 flex items-center justify-between bg-background/50 backdrop-blur-md border-b px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 w-full max-w-md">
         <div className="relative w-full hidden md:block">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search subjects, teachers..." 
              className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
            />
         </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
           <Bell size={20} />
        </Button>
        <div className="h-8 w-[1px] bg-border mx-1 hidden md:block"></div>
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-medium leading-none">Admin User</span>
             <span className="text-xs text-muted-foreground">Principal</span>
          </div>
          <div className="size-9 rounded-full bg-gradient-to-tr from-primary to-violet-400 ring-2 ring-background shadow-sm"></div>
        </div>
      </div>
    </header>
  )
}