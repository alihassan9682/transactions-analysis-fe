import { ChartBarIncreasing } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto py-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
           <ChartBarIncreasing className='text-white'/>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Rule Debugging Console</h1>
            <p className="text-sm text-gray-500">Analyze transaction rules and identify patterns</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">Financial Analytics</p>
            <p className="text-xs text-gray-500">Real-time monitoring</p>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">FA</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
