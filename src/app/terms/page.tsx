import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-8 md:p-16">
      <div className="max-w-3xl mx-auto bg-stone-800 p-8 rounded-2xl shadow-xl border border-stone-700">
        <h1 className="text-3xl font-bold text-green-500 mb-6">Terms of Service</h1>
        <p className="mb-4 text-stone-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-stone-300">
          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">1. Agreement to Terms</h2>
            <p>By accessing or using BlockBamboo (enPIneering), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on BlockBamboo for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">3. Pi Network Integration</h2>
            <p>Our application integrates with the Pi Network SDK. By using our service, you agree to comply with the terms and conditions of the Pi Network. All payments, transactions, and user authentications made through the Pi Wallet are subject to Pi Network's own policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">4. User Generated Content</h2>
            <p>Users may create, upload, and share content (blueprints, chat messages) within the game. You retain all rights to the content you create, but grant us a non-exclusive license to use, reproduce, and display it within the application. You agree not to post any content that is illegal, abusive, or inappropriate.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">5. Disclaimer</h2>
            <p>The materials on BlockBamboo are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
