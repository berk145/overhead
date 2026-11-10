import type React from 'react'

type ReactComponent = React.FC<never> | React.ComponentClass<never> | React.ForwardRefExoticComponent<never>

export const isFunctionComponent = (component: unknown): component is React.FC<never> => typeof component === 'function'

export const isClassComponent = (component: unknown): component is React.ComponentClass<never> => {
  if (typeof component !== 'function') return false
  const prototype: unknown = component.prototype
  return typeof prototype === 'object' && prototype !== null &&
    (('isReactComponent' in prototype && Boolean(prototype.isReactComponent)) || ('render' in prototype && Boolean(prototype.render)))
}

export const isForwardRefComponent = (component: unknown): component is React.ForwardRefExoticComponent<never> =>
  typeof component === 'object' && component !== null && '$$typeof' in component && component.$$typeof === Symbol.for('react.forward_ref')

export const isReactComponent = (component: unknown): component is ReactComponent =>
  isFunctionComponent(component) || isForwardRefComponent(component) || isClassComponent(component)
