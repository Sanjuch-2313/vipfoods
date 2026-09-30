let loading;

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      if (!window.Razorpay) { script.remove(); loading = undefined; }
      resolve(Boolean(window.Razorpay));
    };
    script.onerror = () => {
      script.remove();
      loading = undefined;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return loading;
}
