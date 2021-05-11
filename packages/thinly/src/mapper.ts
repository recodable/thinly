export function createMap(routes) {
  let result = {}

  Object.values(routes).forEach((route) => {
    const parts = route.path.split('/').filter((v) => v)
    result = map(parts, route, result)
  })

  return result
}

export function map([current, ...remaining], value, initialValue) {
  const currentValue = initialValue[current] || {}

  if (remaining.length === 0) {
    const currentRoutes = currentValue._routes || []
    return {
      ...initialValue,
      [current]: { ...currentValue, _routes: [...currentRoutes, value] },
    }
  }

  return {
    ...initialValue,
    [current]: map(remaining, value, currentValue),
  }
}
