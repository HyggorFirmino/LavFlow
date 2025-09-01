export const WASHER_LIST_IDS = ['list-lavadora-1', 'list-lavadora-2', 'list-lavadora-3', 'list-lavadora-4'];
export const DRYER_LIST_IDS = ['list-secadora-1', 'list-secadora-2', 'list-secadora-3', 'list-secadora-4'];

export const INITIAL_LIST_ORDER = [
    'list-1', // Aguardando
    ...WASHER_LIST_IDS,
    ...DRYER_LIST_IDS,
    'list-4', // Pronto para Retirada
    'list-5'  // Finalizado
];

export const INITIAL_LIST_TITLES: Record<string, string> = {
    'list-1': 'Aguardando',
    'list-lavadora-1': 'Lavadora 1',
    'list-lavadora-2': 'Lavadora 2',
    'list-lavadora-3': 'Lavadora 3',
    'list-lavadora-4': 'Lavadora 4',
    'list-secadora-1': 'Secadora 1',
    'list-secadora-2': 'Secadora 2',
    'list-secadora-3': 'Secadora 3',
    'list-secadora-4': 'Secadora 4',
    'list-4': 'Pronto para Retirada',
    'list-5': 'Finalizado'
};


// New, fresh and modern color palette for tags
export const TAG_COLORS = [
    { name: 'Azul Sereno', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
    { name: 'Verde Menta', classes: 'bg-green-100 text-emerald-800 border-emerald-300' },
    { name: 'Lavanda', classes: 'bg-violet-100 text-violet-800 border-violet-300' },
    { name: 'Pêssego', classes: 'bg-orange-100 text-orange-800 border-orange-300' },
    { name: 'Ciano', classes: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { name: 'Rosa Claro', classes: 'bg-pink-100 text-pink-800 border-pink-300' },
    { name: 'Amarelo Manteiga', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { name: 'Cinza Suave', classes: 'bg-slate-200 text-slate-800 border-slate-400' },
];

export const DEFAULT_TAG_COLOR = TAG_COLORS[7].classes; // Cinza Suave