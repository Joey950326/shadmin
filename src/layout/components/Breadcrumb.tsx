import type { RouteHandle } from '@/routers/types'
import { useMemo } from 'react'
import { NavLink, useLocation, useMatches } from 'react-router'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

interface BreadcrumbItemType {
  title?: string
  path: string
  isCurrent?: boolean
}

export default function MyBreadcrumb() {
  const matches = useMatches()
  const location = useLocation()

  const breadcrumbs: Array<BreadcrumbItemType> = useMemo(() => {
    return matches.filter((match) => {
      const handle = match.handle as RouteHandle
      return match.pathname !== '/home/index' && handle && handle.title
    }).map((match) => {
      const handle = match.handle as RouteHandle
      return {
        path: match.pathname,
        title: handle.title,
        isCurrent: match.pathname === location.pathname,
      }
    })
  }, [matches, location.pathname])

  //   console.log('Breadcrumb items:', breadcrumbs) // Debug log for breadcrumb items
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/home/index">首页</NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {
          breadcrumbs.map(item => (
            <div key={item.path} className="flex items-center gap-1">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.isCurrent
                  ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    )
                  : (
                      <BreadcrumbLink asChild>
                        <NavLink to={item.path}>{item.title}</NavLink>
                      </BreadcrumbLink>
                    )}
              </BreadcrumbItem>
            </div>
          ))
        }
      </BreadcrumbList>
    </Breadcrumb>
  )
}
