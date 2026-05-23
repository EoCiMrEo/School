import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDjangoAuth } from "../../contexts/DjangoAuthContext";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get("token"), [searchParams]);

  const {
    userProfile,
    verifyEmail: verifyEmailAction,
    resendVerificationEmail,
    authError,
    clearError,
  } = useDjangoAuth();

  const verifiedOnceRef = useRef(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState("");

  // If token present in URL, attempt auto-verify on mount
  useEffect(() => {
    let isActive = true;
    async function autoVerify() {
      if (!tokenFromUrl || verifiedOnceRef.current) return;
      verifiedOnceRef.current = true; // guard against repeated runs
      setSubmitting(true);
      setInfo("Verifying your email…");
      clearError?.();
      const result = await verifyEmailAction({ token: tokenFromUrl });
      if (!isActive) return;
      setSubmitting(false);
      if (result?.success) {
        setInfo("Email verified successfully. Redirecting…");
        setTimeout(() => navigate("/", { replace: true }), 800);
      } else {
        setInfo("Verification failed. You can request a new link.");
      }
    }
    autoVerify();
    return () => {
      isActive = false;
    };
  }, [tokenFromUrl]);

  // Pre-fill email if we have it in profile
  useEffect(() => {
    if (userProfile?.email) {
      setEmail(userProfile.email);
    }
  }, [userProfile]);

  const onResend = async () => {
    setSubmitting(true);
    setInfo("Sending a new verification link…");
    clearError?.();
    const result = await resendVerificationEmail();
    setSubmitting(false);
    if (result?.success) {
      setInfo("A new verification email has been sent.");
    } else {
      setInfo("");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verify your email</h1>
        <p className="text-sm text-gray-600 mb-6">
          {userProfile?.email
            ? `We sent a verification link to ${userProfile.email}. If you opened this page from the link, we will verify automatically.`
            : "If you opened this page from the link in your email, we will verify automatically."}
        </p>

        {info && (
          <div className="mb-4 rounded bg-blue-50 text-blue-800 text-sm px-3 py-2 border border-blue-100">{info}</div>
        )}
        {authError && (
          <div className="mb-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">{authError}</div>
        )}

        {/* No OTP form – verification happens automatically using the link token */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/auth/profile")}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 disabled:opacity-60"
          >
            Back to profile
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={onResend} disabled={submitting} className="text-sky-700 hover:text-sky-900">
            Resend verification email
          </button>
          <Link to="/auth/profile" className="text-gray-600 hover:text-gray-800">
            Back to profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
