const DarkTheme = ()=> {
    if (process.browser) document.documentElement.classList.replace('__aytaro-white-mode','__aytaro-dark-mode')
}

export default DarkTheme