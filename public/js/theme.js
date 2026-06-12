document.addEventListener('DOMContentLoaded', () => {
  const themeSwitch = document.getElementById('theme-switch');

  if (themeSwitch) {
    // Sincronizar el estado del checkbox con el tema actual
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'dark';
    themeSwitch.checked = currentTheme === 'dark';

    // Escuchar el cambio en el switch
    themeSwitch.addEventListener('change', () => {
      const newTheme = themeSwitch.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      console.log(`[Tema] Cambiado a modo ${newTheme}.`);
    });
  }
});
