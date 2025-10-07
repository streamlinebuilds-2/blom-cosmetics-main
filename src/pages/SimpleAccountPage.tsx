import React from 'react';

export default function SimpleAccountPage() {
  console.log('SimpleAccountPage rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '20px',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1>🚨 SIMPLE ACCOUNT PAGE TEST 🚨</h1>
      <p>If you can see this red page, the component is rendering!</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
      <p>This is a test to see if ANY account page works.</p>
    </div>
  );
}
