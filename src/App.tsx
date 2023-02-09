import { Routes, Route, A } from '@solidjs/router'
import { useLocation } from '@solidjs/router'
import { createEffect, createSignal, For, onCleanup, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

type State = {
  inlineSize: number
  x: number
  transitions: boolean
  isIntersecting: boolean
}

const routes = [
  {
    label: 'Home',
    path: '/',
    component: () => <div>Home</div>,
  },
  {
    label: 'About',
    path: '/about',
    component: () => <div>About</div>,
  },
  {
    label: 'Blog',
    path: '/blog',
    component: () => <div>Blog</div>,
  },
  {
    label: 'Contact',
    path: '/contact',
    component: () => <div>Contact</div>,
  },
]

export default function App() {
  let dynamicHover: HTMLDivElement | undefined
  let navContainer: HTMLDivElement | undefined

  function DynamicHover(props: { state: State; }) {
    const style = () => `
      --dynamic-hover-inline: ${props.state.inlineSize}px;
      --dynamic-hover-x: ${props.state.x}px;
      --dynamic-hover-opacity: ${props.state.isIntersecting ? 1 : 0};
    `

    return (
      <div
        ref={dynamicHover}
        style={style()}
        data-dynamic-hover
        data-state={props.state.transitions ? 'transitions-on' : 'transitions-off'}
        aria-hidden="true"></div>
    )
  }

  const initialState: State = {
    inlineSize: 0,
    x: 0,
    transitions: false,
    isIntersecting: false,
  }

  const location = useLocation()
  const [state, setState] = createStore<State>(initialState)
  let delay: string

  onMount(() => {
    delay = getComputedStyle(dynamicHover!).getPropertyValue('--dynamic-transition-duration')
  })

  function handleMouseEnter() {
    setState({ isIntersecting: true })
    setTimeout(() => setState({ transitions: true }), parseFloat(delay))
  }

  function handleMouseLeave() {
    setState({ isIntersecting: false, transitions: false })
  }

  function handleMouseMove(e: MouseEvent) {
    const space = getComputedStyle(navContainer as HTMLElement).getPropertyValue('--container-space')
    const { target } = e
    const trueTarget = (target as HTMLElement).closest('.nav__item')

    if (!trueTarget) return

    const { width: targetWidth, left: targetEdge } = trueTarget!.getBoundingClientRect()
    const { left: containerEdge } = navContainer!.getBoundingClientRect()
    const offset = Math.floor(targetEdge - containerEdge - parseFloat(space))

    setState({
      inlineSize: targetWidth,
      x: offset,
    })
  } 

  createEffect(() => {
    navContainer?.addEventListener('mousemove', handleMouseMove)
    navContainer?.addEventListener('mouseenter', handleMouseEnter)
    navContainer?.addEventListener('mouseleave', handleMouseLeave)

    onCleanup(() => {
      navContainer?.removeEventListener('mousemove', handleMouseMove)
      navContainer?.removeEventListener('mouseenter', handleMouseEnter)
      navContainer?.removeEventListener('mouseleave', handleMouseLeave)
    })
  })

  return (
    <div>
      <nav ref={navContainer} class="nav-container">
        <ul class="nav">
          <For each={routes}>
            {({ path, label }) => (
              <li>
                <A
                  aria-current={location.pathname === path ? 'page' : false}
                  href={path}
                  class="nav__item"
                  activeClass={''}
                  inactiveClass={''}
                  end>
                  {label}
                </A>
              </li>
            )}
          </For>
        </ul>
        <DynamicHover state={state} />
      </nav>

      <Routes>
        <For each={routes}>{({ path, component }) => <Route path={path} component={component} />}</For>
      </Routes>
    </div>
  )
}
