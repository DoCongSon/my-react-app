import ReactGA from 'react-ga4'

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID
const isProduction = window.location.hostname !== 'localhost'

export const initGA = () => {
  if (isProduction && GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID)
    console.log('Analytics initialized')
  }
}

export const logPageView = () => {
  if (!isProduction) return
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname })
}

export const logEvent = (category: string, action: string, label?: string) => {
  if (!isProduction) return
  ReactGA.event({ category, action, label })
}

export const setUserId = (userId: string | null) => {
  if (!isProduction) return
  if (userId) ReactGA.set({ userId })
}
