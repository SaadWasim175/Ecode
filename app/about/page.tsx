'use client';

import React from 'react';

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8 flex flex-col max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 border-b border-blue-600 pb-2">About This Project</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">What is this app?</h2>
        <p className="text-gray-300 leading-relaxed">
          This is a web-based code editor designed to let you open entire folders from your computer,
          navigate files and folders easily, and edit your code directly in the browser. It supports
          syntax highlighting and autocompletion powered by the Monaco editor, which is the same editor
          behind Visual Studio Code.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">How does it work?</h2>
        <p className="text-gray-300 leading-relaxed">
          Using the File System Access API, the app can ask you to select a folder on your computer.
          It reads the folder contents recursively, builds a navigable file tree on the sidebar, and
          loads the selected file into the editor. You can edit and save your files back to disk without
          leaving the browser.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Technologies used</h2>
        <ul className="list-disc list-inside text-gray-300 leading-relaxed">
          <li>Next.js with React for the frontend</li>
          <li>Monaco Editor for rich code editing experience</li>
          <li>Tailwind CSS for styling and theming</li>
          <li>File System Access API for seamless local file read/write</li>
          <li>TypeScript for safer, scalable code</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Why build this?</h2>
        <p className="text-gray-300 leading-relaxed">
          This project helped me deepen my understanding of modern web APIs, browser security,
          and building developer tools right in the browser. It’s a handy lightweight alternative
          to traditional desktop code editors when you want quick edits without switching apps.
        </p>
      </section>
    </main>
  );
};

export default AboutPage;
