import React from 'react';

export default function Dashboard() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          wordBreak: 'break-word',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            marginBottom: '1.5rem',
            lineHeight: 1.3,
          }}
        >
          👋 Welcome to the
          <br />
          User Management Admin Panel
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: '#ccc',
            marginBottom: '1rem',
          }}
        >
          This dashboard allows you to manage users, roles, permissions, and
          account activity.
        </p>
      </div>
    </div>
  );
}
