// Test component to check if components are updating
import React from 'react';

const TestComponent = ({ action }) => {
  console.log('TestComponent rendering with action:', action);
  
  return (
    <div style={{ 
      width: '280px', 
      height: '400px', 
      backgroundColor: 'yellow', 
      border: '5px solid red',
      padding: '20px',
      margin: '20px'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>TEST COMPONENT</h1>
      <p>Action Key: {action?.key}</p>
      <p>Action Title: {action?.title}</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default TestComponent;
