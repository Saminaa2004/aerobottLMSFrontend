export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
            🎓
          </div>
          <span className="text-2xl font-bold text-gray-900">Teacher LMS</span>
        </div>
        <button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-7 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          Get Started →
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Organize Your{" "}
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Learning
            <br />
            Content
          </span>{" "}
          with Ease
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          A simple, powerful platform to upload, organize, and manage all your
          educational materials. Images, documents, presentations, and videos –
          all in one place.
        </p>
        <button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-9 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
          Start Free →
        </button>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-4">
        <h2 className="text-5xl font-extrabold text-gray-900 text-center mb-16">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl mb-6">
              📁
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Dynamic Sections
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Create unlimited sections to organize your content by subject,
              chapter, or any way you prefer.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-3xl mb-6">
              ⬆️
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Multi-Format Upload
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Support for images, PDFs, Word documents, PowerPoint
              presentations, and video files.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-3xl mb-6">
              🛡️
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Secure & Private
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Your content is protected with secure authentication. Only you can
              access your materials.
            </p>
          </div>
        </div>
      </section>
    
      {/* Footer */}
      <footer className="border-t border-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2024 Teacher LMS. Built for educators.
          </p>
        </div>
      </footer>
    </div>
  );
}