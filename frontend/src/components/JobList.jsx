export default function JobList({ jobs }) {
  // Function to get status-specific styling
  const getStatusStyles = (status) => {
    const styles = {
      Applied: "bg-blue-100 text-blue-800 border-blue-200",
      Interview: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Offer: "bg-green-100 text-green-800 border-green-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    const icons = {
      Applied: "📝",
      Interview: "🎯",
      Offer: "🎉",
      Rejected: "❌",
    };
    return icons[status] || "📌";
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mt-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first job application above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
        </span>
      </div>
      
      {jobs.map((job) => (
        <div 
          key={job._id} 
          className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:border-gray-300"
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{job.company}</h3>
                <p className="text-gray-600 font-medium">{job.position}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyles(job.status)} border`}>
                <span className="mr-1">{getStatusIcon(job.status)}</span>
                {job.status}
              </div>
            </div>
            
            {job.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">📝 Notes:</span> {job.notes}
                </p>
              </div>
            )}
            
            <div className="mt-3 flex items-center text-xs text-gray-400">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Added on {new Date(job.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}