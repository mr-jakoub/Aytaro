const LightTheme = ()=> {
    if (process.browser) {
        document.documentElement.style.setProperty('--White-color', '#ffffff')
        document.documentElement.style.setProperty('--White-color-secondary', '#f0f2f5')
        document.documentElement.style.setProperty('--bluredWhite', 'rgba(255,255,255,.085)')
        document.documentElement.style.setProperty('--Dark-color', '#242526')
        document.documentElement.style.setProperty('--Light-color', '#f0f2f5')
        document.documentElement.style.setProperty('--Grey-color', '#808388')
        document.documentElement.style.setProperty('--Smooth-Back', 'rgba(0,0,0,.07)')
        document.documentElement.style.setProperty('--box-shadow', '0 2px 2px rgba(0,0,0,.08),0 0 2px rgba(0,0,0,.08)')
        document.documentElement.style.setProperty('--box-shadow2', '0 0 2px rgba(0,0,0,.12),0 0 2px rgba(0,0,0,.15)')
        document.documentElement.style.setProperty('--shadow-sm', 'rgba(0,0,0,.38)')
        document.documentElement.style.setProperty('--trangle-shadow', '0 -.5px .5px rgba(0,0,0,.15)')
    }
}

export default LightTheme