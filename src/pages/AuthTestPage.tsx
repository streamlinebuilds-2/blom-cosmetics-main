import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [email, setEmail] = useState('christiaansteffen12345@gmail.com');
  const [password, setPassword] = useState('');

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testSupabaseConnection = async () => {
    addResult('Testing Supabase connection...');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        addResult(`❌ Supabase connection failed: ${error.message}`);
      } else {
        addResult('✅ Supabase connection successful');
      }
    } catch (err) {
      addResult(`❌ Supabase connection exception: ${err}`);
    }
  };

  const testAuthSession = async () => {
    addResult('Testing auth session...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addResult(`❌ Session check failed: ${error.message}`);
      } else if (session) {
        addResult(`✅ Session found: ${session.user.email}`);
      } else {
        addResult('❌ No session found');
      }
    } catch (err) {
      addResult(`❌ Session check exception: ${err}`);
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      addResult('❌ Please enter email and password');
      return;
    }

    addResult(`Testing login with ${email}...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        addResult(`❌ Login failed: ${error.message}`);
      } else {
        addResult(`✅ Login successful: ${data.user?.email}`);
        // Check cookies after login
        const cookies = document.cookie.split('; ').filter(row => row.startsWith('sb-'));
        addResult(`Cookies after login: ${cookies.length} sb- cookies found`);
      }
    } catch (err) {
      addResult(`❌ Login exception: ${err}`);
    }
  };

  const testLogout = async () => {
    addResult('Testing logout...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addResult(`❌ Logout failed: ${error.message}`);
      } else {
        addResult('✅ Logout successful');
        // Check cookies after logout
        const cookies = document.cookie.split('; ').filter(row => row.startsWith('sb-'));
        addResult(`Cookies after logout: ${cookies.length} sb- cookies found`);
      }
    } catch (err) {
      addResult(`❌ Logout exception: ${err}`);
    }
  };

  const checkEnvVars = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addResult(`Environment variables:`);
    addResult(`  VITE_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}`);
    addResult(`  VITE_SUPABASE_ANON_KEY: ${supabaseKey ? 'SET' : 'MISSING'}`);
    
    if (supabaseUrl) {
      addResult(`  URL value: ${supabaseUrl}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    addResult('Auth Test Page loaded');
    checkEnvVars();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Auth Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={testSupabaseConnection}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Supabase Connection
              </button>
              
              <button
                onClick={testAuthSession}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Auth Session
              </button>
              
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  onClick={testLogin}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Test Login
                </button>
              </div>
              
              <button
                onClick={testLogout}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Test Logout
              </button>
              
              <button
                onClick={clearResults}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Results
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
