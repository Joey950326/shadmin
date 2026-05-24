import type { MenuItem } from './MenuItem'
import NavMenuItem from './MenuItem'

interface MenuProps {
  items: MenuItem[]
}

export default function NavMenu({ items }: MenuProps) {
  return (
    <>
      {items.map(item => (
        <NavMenuItem key={item.name} item={item} />
      ))}
    </>
  )
}
