import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="pl-[220px]">{children}</div>
    </div>
  )
}
