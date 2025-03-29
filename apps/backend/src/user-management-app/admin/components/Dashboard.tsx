import React from 'react';

const Dashboard = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        height: '100%',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        👋 Welcome to the User Management Admin Panel
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#ccc' }}>
        This dashboard allows you to manage users, roles, permissions, and
        account activity.
      </p>
      <p style={{ marginTop: '1.5rem', color: '#999' }}>
        You can configure MFA, reset passwords, approve account requests, and
        assign roles all from this interface.
      </p>
    </div>
  );
};

export default Dashboard;
