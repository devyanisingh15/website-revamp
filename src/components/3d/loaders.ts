/**
 * Stable dynamic imports for every 3D scene. Each becomes its own chunk and
 * shares the `three` vendor chunk, which is never part of the initial load.
 */
export const loadHeroTub = () => import('./scenes/HeroTubScene');
export const loadAbsorption = () => import('./scenes/AbsorptionScene');
export const loadCarousel = () => import('./scenes/CarouselScene');
export const loadSwirl = () => import('./scenes/PowderSwirlScene');
export const loadFigure = () => import('./scenes/FigureScene');
export const loadTubViewer = () => import('./scenes/TubViewerScene');
export const loadScoop = () => import('./scenes/ScoopScene');
export const loadNutritionBox = () => import('./scenes/NutritionBoxScene');
export const loadRitual = () => import('./scenes/RitualScene');
