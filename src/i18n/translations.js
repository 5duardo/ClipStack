export const translations = {
  es: {
    // General
    'app.title': 'ClipStack',
    'app.search.placeholder': 'Buscar clips...',
    'app.noResults': 'Sin resultados',
    'app.noClips': 'Copia algo para empezar',
    'app.noResultsWithFilters': 'Sin resultados con los filtros actuales',
    
    // Filters
    'filters.title': 'Filtros:',
    'filters.all': 'Todo',
    'filters.text': 'Texto',
    'filters.image': 'Imagen',
    'filters.always': 'Siempre',
    'filters.today': 'Hoy',
    'filters.week': 'Esta semana',
    'filters.month': 'Este mes',
    
    // TitleBar
    'titlebar.settings': 'Ajustes',
    'titlebar.minimize': 'Minimizar',
    'titlebar.close': 'Cerrar',
    
    // Settings
    'settings.title': 'Ajustes',
    'settings.back': '← Volver',
    'settings.appearance': 'Apariencia',
    'settings.theme': 'Tema',
    'settings.dark': 'Oscuro',
    'settings.light': 'Claro',
    'settings.hotkey': 'Atajo global',
    'settings.hotkey.description': 'Presiona teclas para configurar el atajo',
    'settings.restore': 'Restaurar',
    'settings.data': 'Datos',
    'settings.clearHistory': 'Limpiar historial',
    'settings.clearHistory.description': 'Elimina todos los clips no anclados. Los anclados se conservan.',
    'settings.clearHistory.confirm': '¿Limpiar historial?',
    'settings.clearHistory.confirmText': 'Se eliminarán todos los clips excepto los que tienes anclados. Esta acción no se puede deshacer.',
    'settings.cancel': 'Cancelar',
    'settings.clear': 'Limpiar',
    'settings.about': 'Acerca de',
    'settings.version': 'ClipStack v0.1.0',
    'settings.description': 'Clipboard manager local · Sin nube · Sin cuentas',
    'settings.createdBy': 'Creado por:',
    'settings.license': 'Licencia MIT',
    'settings.language': 'Idioma',
    'settings.system': 'Sistema',
    'settings.launchOnStartup': 'Abrir al iniciar la PC',
    'settings.launchOnStartup.description': 'Inicia ClipStack automáticamente cuando enciendes Windows.',
    
    // Footer
    'footer.navigate': 'navegar',
    'footer.copy': 'copiar',
    'footer.close': 'cerrar',
    'footer.shortcuts': 'Atajos: ↑↓ navegar • Enter copiar • Delete eliminar • Espacio anclar',
    'footer.hotkey': 'Hotkey: ',
    
    // Search
    'search.placeholder': 'Buscar en el portapapeles...',
    'search.back': 'Volver',
    
    // Clip actions
    'clip.copy': 'Copiar',
    'clip.pin': 'Anclar',
    'clip.unpin': 'Desanclar',
    'clip.delete': 'Eliminar',
    'clip.view': 'Ver contenido completo',
    'clip.viewTitle': 'Vista previa',
    'clip.image': 'Imagen',
    'clip.text': 'Texto',
    'clip.close': 'Cerrar',
    'clip.copyContent': 'Copiar',
    'clip.characters': 'caracteres',
    
    // Pinned section
    'pinned.title': 'Anclados',
  },
  en: {
    // General
    'app.title': 'ClipStack',
    'app.search.placeholder': 'Search clips...',
    'app.noResults': 'No results',
    'app.noClips': 'Copy something to start',
    'app.noResultsWithFilters': 'No results with current filters',
    
    // Filters
    'filters.title': 'Filters:',
    'filters.all': 'All',
    'filters.text': 'Text',
    'filters.image': 'Image',
    'filters.always': 'Always',
    'filters.today': 'Today',
    'filters.week': 'This week',
    'filters.month': 'This month',
    
    // TitleBar
    'titlebar.settings': 'Settings',
    'titlebar.minimize': 'Minimize',
    'titlebar.close': 'Close',
    
    // Settings
    'settings.title': 'Settings',
    'settings.back': '← Back',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.hotkey': 'Global hotkey',
    'settings.hotkey.description': 'Press keys to configure hotkey',
    'settings.restore': 'Restore',
    'settings.data': 'Data',
    'settings.clearHistory': 'Clear history',
    'settings.clearHistory.description': 'Removes all non-pinned clips. Pinned clips are preserved.',
    'settings.clearHistory.confirm': 'Clear history?',
    'settings.clearHistory.confirmText': 'All clips except pinned ones will be deleted. This action cannot be undone.',
    'settings.cancel': 'Cancel',
    'settings.clear': 'Clear',
    'settings.about': 'About',
    'settings.version': 'ClipStack v0.1.0',
    'settings.description': 'Local clipboard manager · No cloud · No accounts',
    'settings.createdBy': 'Created by:',
    'settings.license': 'MIT License',
    'settings.language': 'Language',
    'settings.system': 'System',
    'settings.launchOnStartup': 'Open on system startup',
    'settings.launchOnStartup.description': 'Start ClipStack automatically when Windows starts.',
    
    // Footer
    'footer.navigate': 'navigate',
    'footer.copy': 'copy',
    'footer.close': 'close',
    'footer.shortcuts': 'Shortcuts: ↑↓ navigate • Enter copy • Delete delete • Space pin',
    'footer.hotkey': 'Hotkey: ',
    
    // Search
    'search.placeholder': 'Search clipboard...',
    'search.back': 'Back',
    
    // Clip actions
    'clip.copy': 'Copy',
    'clip.pin': 'Pin',
    'clip.unpin': 'Unpin',
    'clip.delete': 'Delete',
    'clip.view': 'View full content',
    'clip.viewTitle': 'Preview',
    'clip.image': 'Image',
    'clip.text': 'Text',
    'clip.close': 'Close',
    'clip.copyContent': 'Copy',
    'clip.characters': 'characters',
    
    // Pinned section
    'pinned.title': 'Pinned',
  },
};

export function t(key, language = 'es') {
  return translations[language]?.[key] || translations.es[key] || key;
}
