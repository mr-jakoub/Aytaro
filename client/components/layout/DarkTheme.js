const DarkTheme = ()=> {
    if (process.browser) {
    document.documentElement.style.setProperty('--White-color', '#1a1a1a')
    document.documentElement.style.setProperty('--White-color-secondary', '#2a2b2b')
    document.documentElement.style.setProperty('--Dark-color', '#ffffff')
    document.documentElement.style.setProperty('--Light-color', '#141414')
    document.documentElement.style.setProperty('--Grey-color', '#b0b3b8')
    document.documentElement.style.setProperty('--Smooth-Back', 'rgba(255,255,255,.07)')
    document.documentElement.style.setProperty('--box-shadow', '0 2px 2px rgba(255,255,255,.08),0 0 2px rgba(255,255,255,.08)')
    document.documentElement.style.setProperty('--box-shadow2', '0 0 2px rgba(255,255,255,.12),0 0 2px rgba(255,255,255,.15)')
    document.documentElement.style.setProperty('--shadow-sm', 'rgba(255,255,255,.38)')
    document.documentElement.style.setProperty('--trangle-shadow', '0 -.5px .5px rgba(255,255,255,.15)')
    }
}

export default DarkTheme