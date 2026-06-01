import svgSrc from '@/assets/local-svg/home-welcome.svg'

function HomePage() {
  return (
    <div className="flex flex-col items-center size-full">
      <object data={svgSrc} type="image/svg+xml" className="size-[80%]" />
      <div className="text-2xl font-bold">欢迎来到Shadmin</div>
    </div>
  )
}

export default HomePage
