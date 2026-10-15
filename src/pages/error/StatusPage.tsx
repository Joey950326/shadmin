import type { ReactNode } from 'react'

interface StatusPageProps {
  illustration: string
  title: string
  description: string
  children: ReactNode
}

function StatusPage({
  illustration,
  title,
  description,
  children,
}: StatusPageProps) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 p-6 text-center">
      <object
        data={illustration}
        type="image/svg+xml"
        aria-hidden="true"
        className="h-auto w-full max-w-[28rem]"
      />
      <div className="flex max-w-lg flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">{children}</div>
    </div>
  )
}

export default StatusPage
