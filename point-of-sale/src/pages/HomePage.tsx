import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">SuperMarket POS</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">Complete point of sale system for supermarket management</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/pos"
            className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Start Selling
          </Link>
          <Link to="/dashboard" className="text-sm font-semibold leading-6 text-gray-900">
            Dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
