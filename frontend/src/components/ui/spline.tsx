'use client'
import { Suspense, lazy } from 'react'
import LoaderOne from './loader-one'

const Spline = lazy(() => import('@splinetool/react-spline'))
export function SplineScene({ scene, className }: 
  { scene: string; className?: string }) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center">
        <LoaderOne />
      </div>
    }>
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
