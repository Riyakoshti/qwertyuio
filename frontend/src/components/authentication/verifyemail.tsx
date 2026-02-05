// src/components/authentication/verifyemail.tsx
import React, { useEffect } from 'react';

const Verifyemail = () => {
  return (
    <div className="verify-page">
      <div className="verify-card">
        <h2>📧 Verify your email</h2>
        <p>
          We have sent a verification link to your email.
          <br />
          Please open your inbox and click the link.
        </p>
        <p style={{ fontSize: "13px", marginTop: "10px", color: "#555" }}>
          (Check spam folder if not found)
        </p>
      </div>
    </div>
  );
};

export default Verifyemail;
