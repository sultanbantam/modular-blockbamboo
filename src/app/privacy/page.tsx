import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-8 md:p-16">
      <div className="max-w-3xl mx-auto bg-stone-800 p-8 rounded-2xl shadow-xl border border-stone-700">
        <h1 className="text-3xl font-bold text-green-500 mb-6">Privacy Policy</h1>
        <p className="mb-4 text-stone-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-stone-300">
          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">1. Introduction</h2>
            <p>Welcome to BlockBamboo (enPIneering). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">2. Information We Collect</h2>
            <p>We collect personal information that you provide to us such as name, contact information, and Pi Network UID when you authenticate using the Pi SDK. We only collect information that is strictly necessary to provide the core functionality of the game and multiplayer features.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">3. How We Use Your Information</h2>
            <p>We use the information we collect or receive:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To facilitate account creation and logon process through Pi Network.</li>
              <li>To manage user accounts and game progression (XP, profiles unlocked).</li>
              <li>To enable user-to-user communications in multiplayer rooms.</li>
              <li>To process Pi payments and donations securely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">4. Will Your Information be Shared with Anyone?</h2>
            <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Your Pi username may be visible to other players when you join a multiplayer room.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-500 mb-2">5. How Long Do We Keep Your Information?</h2>
            <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
